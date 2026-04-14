import api from "../services/api";

const useApiKeySettings = () => {
    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: '/api-key-field',
            method: 'PUT',
            data
        });
        return responseData;
    }

    const get = async () => {
        const { data } = await api.request({
            url: '/company-api-keys',
            method: 'GET'
        });
        return data;
    }

    return {
        update,
        get
    }
}

export default useApiKeySettings;
