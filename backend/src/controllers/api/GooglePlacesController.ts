import { Request, Response } from "express";
import axios from "axios";
import AppError from "../../errors/AppError";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export const search = async (req: Request, res: Response): Promise<Response> => {
  if (!GOOGLE_API_KEY) {
    throw new AppError("GOOGLE_PLACES_API_KEY not configured", 500);
  }

  const {
    city,
    state,
    query,
    type,
    keyword,
    radius = 5000,
    openNow,
    minRating,
    minUserRatings,
    hasWebsite,
    pageToken
  } = req.query as Record<string, string>;

  if (!city || !state) {
    throw new AppError("CITY_AND_STATE_REQUIRED", 400);
  }

  try {
    // 1) Geocode city+state para obter lat/lng
    const address = `${city}, ${state}, Brazil`;
    const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";

    const geoResp = await axios.get(geocodeUrl, {
      params: {
        address,
        key: GOOGLE_API_KEY
      }
    });

    if (!geoResp.data.results?.length) {
      throw new AppError("GEOCODE_NOT_FOUND", 404);
    }

    const location = geoResp.data.results[0].geometry.location;
    const lat = location.lat;
    const lng = location.lng;

    // 2) Buscar lugares no Places Text Search
    const placesUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";

    const textQuery = query || keyword || "";

    const placesParams: any = {
      key: GOOGLE_API_KEY,
      location: `${lat},${lng}`,
      radius,
      language: "pt-BR",
      region: "br"
    };

    if (textQuery) {
      placesParams.query = textQuery;
    }
    if (type) {
      placesParams.type = type;
    }
    if (keyword) {
      placesParams.keyword = keyword;
    }
    if (pageToken) {
      placesParams.pagetoken = pageToken;
    }
    if (typeof openNow !== "undefined") {
      placesParams.opennow = openNow === "true";
    }

    const placesResp = await axios.get(placesUrl, { params: placesParams });

    let results = placesResp.data.results || [];

    // 3) Filtros locais: rating e número de avaliações
    const minRatingNum = minRating ? Number(minRating) : undefined;
    const minUserRatingsNum = minUserRatings ? Number(minUserRatings) : undefined;

    if (minRatingNum) {
      results = results.filter((r: any) => (r.rating || 0) >= minRatingNum);
    }

    if (minUserRatingsNum) {
      results = results.filter(
        (r: any) => (r.user_ratings_total || 0) >= minUserRatingsNum
      );
    }

    // 4) Se quiser filtrar por website, precisamos consultar Place Details
    let detailed: any[] = results;
    if (typeof hasWebsite !== "undefined") {
      const wantsWebsite = hasWebsite === "true";
      const detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json";

      detailed = [];
      for (const place of results) {
        try {
          const detailsResp = await axios.get(detailsUrl, {
            params: {
              place_id: place.place_id,
              fields: "name,formatted_address,geometry,website,formatted_phone_number,types,rating,user_ratings_total",
              key: GOOGLE_API_KEY,
              language: "pt-BR",
              region: "br"
            }
          });
          const det = detailsResp.data.result;
          const hasSite = !!det.website;
          if ((wantsWebsite && hasSite) || (!wantsWebsite && !hasSite)) {
            detailed.push({ ...place, details: det });
          }
        } catch {
          // Ignorar erro individual de detalhe
        }
      }
    }

    const finalResults = (typeof hasWebsite !== "undefined" ? detailed : results).map(
      (r: any) => {
        const base = r.details || r;
        return {
          name: base.name,
          address: base.formatted_address,
          lat: base.geometry?.location?.lat,
          lng: base.geometry?.location?.lng,
          rating: base.rating,
          userRatingsTotal: base.user_ratings_total,
          placeId: base.place_id || r.place_id,
          website: base.website || null,
          phone: base.formatted_phone_number || null,
          types: base.types || []
        };
      }
    );

    return res.status(200).json({
      results: finalResults,
      nextPageToken: placesResp.data.next_page_token || null
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("GOOGLE_PLACES_ERROR", 500);
  }
};
