--
-- PostgreSQL database dump
--

\restrict I3zNzRxrUv530N4nOIP9SC1YLB8XceIj5NBRzMfJHXIeAS5mAfzqgldeiaKu5zB

-- Dumped from database version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;@
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: enum_MobileWebhooks_platform; Type: TYPE; Schema: public; Owner: empresa
--

CREATE TYPE public."enum_MobileWebhooks_platform" AS ENUM (
    'android',
    'ios'
);


ALTER TYPE public."enum_MobileWebhooks_platform" OWNER TO empresa;

--
-- Name: update_produtocategorias_updated_at(); Type: FUNCTION; Schema: public; Owner: empresa
--

CREATE FUNCTION public.update_produtocategorias_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_produtocategorias_updated_at() OWNER TO empresa;

--
-- Name: update_tutorial_videos_updated_at(); Type: FUNCTION; Schema: public; Owner: empresa
--

CREATE FUNCTION public.update_tutorial_videos_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_tutorial_videos_updated_at() OWNER TO empresa;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: empresa
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO empresa;

--
-- Name: update_user_device_updated_at(); Type: FUNCTION; Schema: public; Owner: empresa
--

CREATE FUNCTION public.update_user_device_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_user_device_updated_at() OWNER TO empresa;

--
-- Name: update_user_page_permissions_updated_at(); Type: FUNCTION; Schema: public; Owner: empresa
--

CREATE FUNCTION public.update_user_page_permissions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_user_page_permissions_updated_at() OWNER TO empresa;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AffiliateCommissions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."AffiliateCommissions" (
    id integer NOT NULL,
    "affiliateId" integer NOT NULL,
    "referredCompanyId" integer NOT NULL,
    "invoiceId" integer NOT NULL,
    "commissionAmount" numeric(10,2) NOT NULL,
    "commissionRate" numeric(5,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paidAt" timestamp without time zone,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "faturaId" integer,
    CONSTRAINT "AffiliateCommissions_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public."AffiliateCommissions" OWNER TO empresa;

--
-- Name: AffiliateCommissions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."AffiliateCommissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AffiliateCommissions_id_seq" OWNER TO empresa;

--
-- Name: AffiliateCommissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."AffiliateCommissions_id_seq" OWNED BY public."AffiliateCommissions".id;


--
-- Name: AffiliateLinks; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."AffiliateLinks" (
    id integer NOT NULL,
    "affiliateId" integer NOT NULL,
    code character varying(255) NOT NULL,
    url character varying(500) NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    signups integer DEFAULT 0 NOT NULL,
    conversions integer DEFAULT 0 NOT NULL,
    "trackingData" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."AffiliateLinks" OWNER TO empresa;

--
-- Name: AffiliateLinks_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."AffiliateLinks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AffiliateLinks_id_seq" OWNER TO empresa;

--
-- Name: AffiliateLinks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."AffiliateLinks_id_seq" OWNED BY public."AffiliateLinks".id;


--
-- Name: AffiliateWithdrawals; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."AffiliateWithdrawals" (
    id integer NOT NULL,
    "affiliateId" integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "paymentMethod" character varying(255) NOT NULL,
    "paymentDetails" jsonb NOT NULL,
    notes text,
    "rejectionReason" text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp without time zone,
    "processedBy" integer,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "AffiliateWithdrawals_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public."AffiliateWithdrawals" OWNER TO empresa;

--
-- Name: AffiliateWithdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."AffiliateWithdrawals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AffiliateWithdrawals_id_seq" OWNER TO empresa;

--
-- Name: AffiliateWithdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."AffiliateWithdrawals_id_seq" OWNED BY public."AffiliateWithdrawals".id;


--
-- Name: Affiliates; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Affiliates" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "affiliateCode" character varying(255) NOT NULL,
    "commissionRate" numeric(5,2) DEFAULT 10.00 NOT NULL,
    "minWithdrawAmount" numeric(10,2) DEFAULT 50.00 NOT NULL,
    "totalEarned" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "totalWithdrawn" numeric(10,2) DEFAULT 0.00 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Affiliates_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public."Affiliates" OWNER TO empresa;

--
-- Name: Affiliates_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Affiliates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Affiliates_id_seq" OWNER TO empresa;

--
-- Name: Affiliates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Affiliates_id_seq" OWNED BY public."Affiliates".id;


--
-- Name: Announcements; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Announcements" (
    id integer NOT NULL,
    priority integer,
    title character varying(255) NOT NULL,
    text text NOT NULL,
    "mediaPath" text,
    "mediaName" text,
    "companyId" integer NOT NULL,
    status boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Announcements" OWNER TO empresa;

--
-- Name: Announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Announcements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Announcements_id_seq" OWNER TO empresa;

--
-- Name: Announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Announcements_id_seq" OWNED BY public."Announcements".id;


--
-- Name: ApiUsages; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ApiUsages" (
    id integer NOT NULL,
    "companyId" integer DEFAULT 0,
    "dateUsed" text NOT NULL,
    "UsedOnDay" integer DEFAULT 0,
    "usedText" integer DEFAULT 0,
    "usedPDF" integer DEFAULT 0,
    "usedImage" integer DEFAULT 0,
    "usedVideo" integer DEFAULT 0,
    "usedOther" integer DEFAULT 0,
    "usedCheckNumber" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ApiUsages" OWNER TO empresa;

--
-- Name: ApiUsages_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ApiUsages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ApiUsages_id_seq" OWNER TO empresa;

--
-- Name: ApiUsages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ApiUsages_id_seq" OWNED BY public."ApiUsages".id;


--
-- Name: AutomationActions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."AutomationActions" (
    id integer NOT NULL,
    "automationId" integer NOT NULL,
    "actionType" character varying(50) NOT NULL,
    "actionConfig" jsonb DEFAULT '{}'::jsonb,
    "order" integer DEFAULT 1,
    "delayMinutes" integer DEFAULT 0,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."AutomationActions" OWNER TO empresa;

--
-- Name: AutomationActions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."AutomationActions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AutomationActions_id_seq" OWNER TO empresa;

--
-- Name: AutomationActions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."AutomationActions_id_seq" OWNED BY public."AutomationActions".id;


--
-- Name: AutomationExecutions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."AutomationExecutions" (
    id integer NOT NULL,
    "automationId" integer NOT NULL,
    "automationActionId" integer NOT NULL,
    "contactId" integer,
    "ticketId" integer,
    "scheduledAt" timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    attempts integer DEFAULT 0,
    "lastAttemptAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    error text,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."AutomationExecutions" OWNER TO empresa;

--
-- Name: AutomationExecutions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."AutomationExecutions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AutomationExecutions_id_seq" OWNER TO empresa;

--
-- Name: AutomationExecutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."AutomationExecutions_id_seq" OWNED BY public."AutomationExecutions".id;


--
-- Name: AutomationLogs; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."AutomationLogs" (
    id integer NOT NULL,
    "automationId" integer NOT NULL,
    "contactId" integer,
    "ticketId" integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    "executedAt" timestamp with time zone,
    result jsonb DEFAULT '{}'::jsonb,
    error text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."AutomationLogs" OWNER TO empresa;

--
-- Name: AutomationLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."AutomationLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AutomationLogs_id_seq" OWNER TO empresa;

--
-- Name: AutomationLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."AutomationLogs_id_seq" OWNED BY public."AutomationLogs".id;


--
-- Name: Automations; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Automations" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "triggerType" character varying(50) NOT NULL,
    "triggerConfig" jsonb DEFAULT '{}'::jsonb,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Automations" OWNER TO empresa;

--
-- Name: Automations_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Automations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Automations_id_seq" OWNER TO empresa;

--
-- Name: Automations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Automations_id_seq" OWNED BY public."Automations".id;


--
-- Name: Baileys; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Baileys" (
    id integer NOT NULL,
    "whatsappId" integer NOT NULL,
    contacts jsonb,
    chats jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Baileys" OWNER TO empresa;

--
-- Name: Baileys_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Baileys_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Baileys_id_seq" OWNER TO empresa;

--
-- Name: Baileys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Baileys_id_seq" OWNED BY public."Baileys".id;


--
-- Name: CallRecords; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."CallRecords" (
    id integer NOT NULL,
    "callId" character varying(255),
    type character varying(255) DEFAULT 'incoming'::character varying NOT NULL,
    status character varying(255) DEFAULT 'missed'::character varying NOT NULL,
    "fromNumber" character varying(255),
    "toNumber" character varying(255),
    duration integer DEFAULT 0,
    "recordingUrl" text,
    "contactId" integer,
    "whatsappId" integer,
    "ticketId" integer,
    "userId" integer,
    "companyId" integer NOT NULL,
    "callStartedAt" timestamp without time zone,
    "callEndedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."CallRecords" OWNER TO empresa;

--
-- Name: CallRecords_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."CallRecords_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CallRecords_id_seq" OWNER TO empresa;

--
-- Name: CallRecords_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."CallRecords_id_seq" OWNED BY public."CallRecords".id;


--
-- Name: CampaignSettings; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."CampaignSettings" (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CampaignSettings" OWNER TO empresa;

--
-- Name: CampaignSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."CampaignSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CampaignSettings_id_seq" OWNER TO empresa;

--
-- Name: CampaignSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."CampaignSettings_id_seq" OWNED BY public."CampaignSettings".id;


--
-- Name: CampaignShipping; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."CampaignShipping" (
    id integer NOT NULL,
    "jobId" character varying(255),
    number character varying(255) NOT NULL,
    message text NOT NULL,
    "confirmationMessage" text,
    confirmation boolean,
    "contactId" integer,
    "campaignId" integer NOT NULL,
    "confirmationRequestedAt" timestamp with time zone,
    "confirmedAt" timestamp with time zone,
    "deliveredAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CampaignShipping" OWNER TO empresa;

--
-- Name: CampaignShipping_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."CampaignShipping_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CampaignShipping_id_seq" OWNER TO empresa;

--
-- Name: CampaignShipping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."CampaignShipping_id_seq" OWNED BY public."CampaignShipping".id;


--
-- Name: Campaigns; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Campaigns" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    message1 text DEFAULT ''::text,
    message2 text DEFAULT ''::text,
    message3 text DEFAULT ''::text,
    message4 text DEFAULT ''::text,
    message5 text DEFAULT ''::text,
    "confirmationMessage1" text DEFAULT ''::text,
    "confirmationMessage2" text DEFAULT ''::text,
    "confirmationMessage3" text DEFAULT ''::text,
    "confirmationMessage4" text DEFAULT ''::text,
    "confirmationMessage5" text DEFAULT ''::text,
    status character varying(255),
    confirmation boolean DEFAULT false,
    "mediaPath" text,
    "mediaName" text,
    "companyId" integer NOT NULL,
    "contactListId" integer,
    "whatsappId" integer,
    "scheduledAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "queueId" integer,
    "statusTicket" character varying(255) DEFAULT 'closed'::character varying,
    "openTicket" character varying(255) DEFAULT 'disabled'::character varying
);


ALTER TABLE public."Campaigns" OWNER TO empresa;

--
-- Name: Campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Campaigns_id_seq" OWNER TO empresa;

--
-- Name: Campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Campaigns_id_seq" OWNED BY public."Campaigns".id;


--
-- Name: ChatMessages; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ChatMessages" (
    id integer NOT NULL,
    "chatId" integer NOT NULL,
    "senderId" integer NOT NULL,
    message text DEFAULT ''::text,
    "mediaPath" text,
    "mediaName" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatMessages" OWNER TO empresa;

--
-- Name: ChatMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ChatMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ChatMessages_id_seq" OWNER TO empresa;

--
-- Name: ChatMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ChatMessages_id_seq" OWNED BY public."ChatMessages".id;


--
-- Name: ChatUsers; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ChatUsers" (
    id integer NOT NULL,
    "chatId" integer NOT NULL,
    "userId" integer NOT NULL,
    unreads integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatUsers" OWNER TO empresa;

--
-- Name: ChatUsers_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ChatUsers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ChatUsers_id_seq" OWNER TO empresa;

--
-- Name: ChatUsers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ChatUsers_id_seq" OWNED BY public."ChatUsers".id;


--
-- Name: Chatbots; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Chatbots" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "queueId" integer,
    "chatbotId" integer,
    "greetingMessage" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isAgent" boolean DEFAULT false,
    "optQueueId" integer,
    "optUserId" integer,
    "queueType" character varying(255) DEFAULT 'text'::character varying NOT NULL,
    "optIntegrationId" integer,
    "optFileId" integer,
    "closeTicket" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Chatbots" OWNER TO empresa;

--
-- Name: Chatbots_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Chatbots_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Chatbots_id_seq" OWNER TO empresa;

--
-- Name: Chatbots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Chatbots_id_seq" OWNED BY public."Chatbots".id;


--
-- Name: Chats; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Chats" (
    id integer NOT NULL,
    title text DEFAULT ''::text,
    uuid character varying(255) DEFAULT ''::character varying,
    "ownerId" integer NOT NULL,
    "lastMessage" text,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Chats" OWNER TO empresa;

--
-- Name: Chats_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Chats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Chats_id_seq" OWNER TO empresa;

--
-- Name: Chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Chats_id_seq" OWNED BY public."Chats".id;


--
-- Name: Companies; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Companies" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "planId" integer,
    status boolean DEFAULT true,
    schedules jsonb DEFAULT '[]'::jsonb,
    "dueDate" timestamp with time zone,
    recurrence character varying(255) DEFAULT ''::character varying,
    document character varying(255) DEFAULT ''::character varying,
    "paymentMethod" character varying(255) DEFAULT ''::character varying,
    "lastLogin" timestamp with time zone,
    "folderSize" character varying(255),
    "numberFileFolder" character varying(255),
    "updatedAtFolder" character varying(255),
    type character varying(10) DEFAULT 'pf'::character varying NOT NULL,
    segment character varying(50) DEFAULT 'outros'::character varying NOT NULL,
    "loadingImage" character varying(255),
    "affiliateId" integer,
    "couponId" integer,
    "referredBy" integer,
    "affiliateLinkId" integer
);


ALTER TABLE public."Companies" OWNER TO empresa;

--
-- Name: CompaniesSettings; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."CompaniesSettings" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "hoursCloseTicketsAuto" character varying(255) NOT NULL,
    "chatBotType" character varying(255) NOT NULL,
    "acceptCallWhatsapp" character varying(255) NOT NULL,
    "userRandom" character varying(255) NOT NULL,
    "sendGreetingMessageOneQueues" character varying(255) NOT NULL,
    "sendSignMessage" character varying(255) NOT NULL,
    "sendFarewellWaitingTicket" character varying(255) NOT NULL,
    "userRating" character varying(255) NOT NULL,
    "sendGreetingAccepted" character varying(255) NOT NULL,
    "CheckMsgIsGroup" character varying(255) NOT NULL,
    "sendQueuePosition" character varying(255) NOT NULL,
    "scheduleType" character varying(255) NOT NULL,
    "acceptAudioMessageContact" character varying(255) NOT NULL,
    "enableLGPD" character varying(255) NOT NULL,
    "sendMsgTransfTicket" character varying(255) NOT NULL,
    "requiredTag" character varying(255) NOT NULL,
    "lgpdDeleteMessage" character varying(255) NOT NULL,
    "lgpdHideNumber" character varying(255) NOT NULL,
    "lgpdConsent" character varying(255) NOT NULL,
    "lgpdLink" character varying(255),
    "lgpdMessage" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "DirectTicketsToWallets" boolean DEFAULT false,
    "closeTicketOnTransfer" boolean DEFAULT false,
    "greetingAcceptedMessage" text DEFAULT ''::text,
    "AcceptCallWhatsappMessage" text DEFAULT ''::text,
    "sendQueuePositionMessage" text DEFAULT ''::text,
    "transferMessage" text DEFAULT ''::text,
    "showNotificationPending" boolean DEFAULT false NOT NULL,
    "notificameHub" character varying(255),
    "autoSaveContacts" character varying(20) DEFAULT 'disabled'::character varying,
    "autoSaveContactsScore" integer DEFAULT 7,
    "autoSaveContactsReason" character varying(50) DEFAULT 'high_potential'::character varying
);


ALTER TABLE public."CompaniesSettings" OWNER TO empresa;

--
-- Name: CompaniesSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."CompaniesSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CompaniesSettings_id_seq" OWNER TO empresa;

--
-- Name: CompaniesSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."CompaniesSettings_id_seq" OWNED BY public."CompaniesSettings".id;


--
-- Name: Companies_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Companies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Companies_id_seq" OWNER TO empresa;

--
-- Name: Companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Companies_id_seq" OWNED BY public."Companies".id;


--
-- Name: ContactCustomFields; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ContactCustomFields" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    "contactId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactCustomFields" OWNER TO empresa;

--
-- Name: ContactCustomFields_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ContactCustomFields_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ContactCustomFields_id_seq" OWNER TO empresa;

--
-- Name: ContactCustomFields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ContactCustomFields_id_seq" OWNED BY public."ContactCustomFields".id;


--
-- Name: ContactGroups; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ContactGroups" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "contactId" integer,
    "companyId" integer,
    "userId" integer
);


ALTER TABLE public."ContactGroups" OWNER TO empresa;

--
-- Name: ContactGroups_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ContactGroups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ContactGroups_id_seq" OWNER TO empresa;

--
-- Name: ContactGroups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ContactGroups_id_seq" OWNED BY public."ContactGroups".id;


--
-- Name: ContactListItems; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ContactListItems" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    email character varying(255),
    "contactListId" integer NOT NULL,
    "isWhatsappValid" boolean DEFAULT false,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isGroup" boolean DEFAULT false
);


ALTER TABLE public."ContactListItems" OWNER TO empresa;

--
-- Name: ContactListItems_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ContactListItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ContactListItems_id_seq" OWNER TO empresa;

--
-- Name: ContactListItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ContactListItems_id_seq" OWNED BY public."ContactListItems".id;


--
-- Name: ContactLists; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ContactLists" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactLists" OWNER TO empresa;

--
-- Name: ContactLists_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ContactLists_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ContactLists_id_seq" OWNER TO empresa;

--
-- Name: ContactLists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ContactLists_id_seq" OWNED BY public."ContactLists".id;


--
-- Name: ContactTags; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ContactTags" (
    "contactId" integer NOT NULL,
    "tagId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactTags" OWNER TO empresa;

--
-- Name: ContactWallets; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ContactWallets" (
    id integer NOT NULL,
    "walletId" integer NOT NULL,
    "contactId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ContactWallets" OWNER TO empresa;

--
-- Name: ContactWallets_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ContactWallets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ContactWallets_id_seq" OWNER TO empresa;

--
-- Name: ContactWallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ContactWallets_id_seq" OWNED BY public."ContactWallets".id;


--
-- Name: Contacts; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Contacts" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    "profilePicUrl" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    email character varying(255) DEFAULT ''::character varying NOT NULL,
    "isGroup" boolean DEFAULT false NOT NULL,
    "companyId" integer,
    "acceptAudioMessage" boolean DEFAULT true NOT NULL,
    channel text DEFAULT 'whatsapp'::text,
    active boolean DEFAULT true,
    "disableBot" boolean DEFAULT false NOT NULL,
    "remoteJid" character varying(255) DEFAULT NULL::character varying,
    "lgpdAcceptedAt" timestamp with time zone,
    "urlPicture" text,
    "pictureUpdated" boolean DEFAULT false NOT NULL,
    "whatsappId" integer,
    "isLid" boolean DEFAULT false NOT NULL,
    birthday timestamp without time zone,
    anniversary timestamp without time zone,
    info text,
    files jsonb,
    "cpfCnpj" character varying(32),
    address character varying(255),
    lid character varying(255),
    "savedToPhone" boolean DEFAULT false,
    "savedToPhoneAt" timestamp with time zone,
    "savedToPhoneReason" character varying(100),
    "potentialScore" integer DEFAULT 0,
    "isPotential" boolean DEFAULT false,
    "lidStability" character varying(20) DEFAULT 'unknown'::character varying
);


ALTER TABLE public."Contacts" OWNER TO empresa;

--
-- Name: Contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Contacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Contacts_id_seq" OWNER TO empresa;

--
-- Name: Contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Contacts_id_seq" OWNED BY public."Contacts".id;


--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Coupons" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    "discountType" character varying(20) DEFAULT 'percentage'::character varying NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "minPlanAmount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "maxUses" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "validUntil" timestamp without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Coupons_discountType_check" CHECK ((("discountType")::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying])::text[])))
);


ALTER TABLE public."Coupons" OWNER TO empresa;

--
-- Name: Coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Coupons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Coupons_id_seq" OWNER TO empresa;

--
-- Name: Coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Coupons_id_seq" OWNED BY public."Coupons".id;


--
-- Name: DialogChatBots; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."DialogChatBots" (
    id integer NOT NULL,
    awaiting integer DEFAULT 0 NOT NULL,
    "contactId" integer,
    "chatbotId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "queueId" integer
);


ALTER TABLE public."DialogChatBots" OWNER TO empresa;

--
-- Name: DialogChatBots_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."DialogChatBots_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DialogChatBots_id_seq" OWNER TO empresa;

--
-- Name: DialogChatBots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."DialogChatBots_id_seq" OWNED BY public."DialogChatBots".id;


--
-- Name: Faturas; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Faturas" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "contactId" integer NOT NULL,
    valor numeric(12,2) NOT NULL,
    descricao text,
    status character varying(20) DEFAULT 'pendente'::character varying NOT NULL,
    "dataCriacao" timestamp without time zone DEFAULT now(),
    "dataVencimento" timestamp without time zone NOT NULL,
    "dataPagamento" timestamp without time zone,
    recorrente boolean DEFAULT false NOT NULL,
    intervalo character varying(20),
    "proximaCobranca" timestamp without time zone,
    "limiteRecorrencias" integer,
    "recorrenciasRealizadas" integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."Faturas" OWNER TO empresa;

--
-- Name: Faturas_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Faturas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Faturas_id_seq" OWNER TO empresa;

--
-- Name: Faturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Faturas_id_seq" OWNED BY public."Faturas".id;


--
-- Name: Ferramentas; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Ferramentas" (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    url text NOT NULL,
    metodo character varying(10) NOT NULL,
    headers jsonb,
    body jsonb,
    query_params jsonb,
    placeholders jsonb,
    status character varying(20) DEFAULT 'ativo'::character varying,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "companyId" integer
);


ALTER TABLE public."Ferramentas" OWNER TO empresa;

--
-- Name: Ferramentas_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Ferramentas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Ferramentas_id_seq" OWNER TO empresa;

--
-- Name: Ferramentas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Ferramentas_id_seq" OWNED BY public."Ferramentas".id;


--
-- Name: Files; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Files" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    name character varying(255) NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Files" OWNER TO empresa;

--
-- Name: FilesOptions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."FilesOptions" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    path character varying(255) NOT NULL,
    "fileId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mediaType" character varying(255) DEFAULT ''::character varying
);


ALTER TABLE public."FilesOptions" OWNER TO empresa;

--
-- Name: FilesOptions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."FilesOptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FilesOptions_id_seq" OWNER TO empresa;

--
-- Name: FilesOptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."FilesOptions_id_seq" OWNED BY public."FilesOptions".id;


--
-- Name: Files_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Files_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Files_id_seq" OWNER TO empresa;

--
-- Name: Files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Files_id_seq" OWNED BY public."Files".id;


--
-- Name: FlowAudios; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."FlowAudios" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FlowAudios" OWNER TO empresa;

--
-- Name: FlowAudios_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."FlowAudios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FlowAudios_id_seq" OWNER TO empresa;

--
-- Name: FlowAudios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."FlowAudios_id_seq" OWNED BY public."FlowAudios".id;


--
-- Name: FlowBuilders; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."FlowBuilders" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    active boolean DEFAULT true,
    flow json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id integer DEFAULT 0 NOT NULL,
    variables json
);


ALTER TABLE public."FlowBuilders" OWNER TO empresa;

--
-- Name: FlowBuilders_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."FlowBuilders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FlowBuilders_id_seq" OWNER TO empresa;

--
-- Name: FlowBuilders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."FlowBuilders_id_seq" OWNED BY public."FlowBuilders".id;


--
-- Name: FlowCampaigns; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."FlowCampaigns" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "flowId" integer NOT NULL,
    phrase character varying(255) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "whatsappId" integer,
    phrases text,
    "matchType" character varying(20)
);


ALTER TABLE public."FlowCampaigns" OWNER TO empresa;

--
-- Name: FlowCampaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."FlowCampaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FlowCampaigns_id_seq" OWNER TO empresa;

--
-- Name: FlowCampaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."FlowCampaigns_id_seq" OWNED BY public."FlowCampaigns".id;


--
-- Name: FlowDefaults; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."FlowDefaults" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    "flowIdWelcome" integer,
    "flowIdNotPhrase" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FlowDefaults" OWNER TO empresa;

--
-- Name: FlowDefaults_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."FlowDefaults_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FlowDefaults_id_seq" OWNER TO empresa;

--
-- Name: FlowDefaults_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."FlowDefaults_id_seq" OWNED BY public."FlowDefaults".id;


--
-- Name: FlowImgs; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."FlowImgs" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FlowImgs" OWNER TO empresa;

--
-- Name: FlowImgs_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."FlowImgs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FlowImgs_id_seq" OWNER TO empresa;

--
-- Name: FlowImgs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."FlowImgs_id_seq" OWNED BY public."FlowImgs".id;


--
-- Name: GoogleCalendarIntegrations; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."GoogleCalendarIntegrations" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "googleUserId" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "accessToken" text NOT NULL,
    "refreshToken" text NOT NULL,
    "expiryDate" timestamp with time zone,
    "calendarId" character varying(255) DEFAULT 'primary'::character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" integer
);


ALTER TABLE public."GoogleCalendarIntegrations" OWNER TO empresa;

--
-- Name: GoogleCalendarIntegrations_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."GoogleCalendarIntegrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GoogleCalendarIntegrations_id_seq" OWNER TO empresa;

--
-- Name: GoogleCalendarIntegrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."GoogleCalendarIntegrations_id_seq" OWNED BY public."GoogleCalendarIntegrations".id;


--
-- Name: GoogleSheetsTokens; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."GoogleSheetsTokens" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "googleUserId" character varying,
    email character varying,
    "accessToken" text,
    "refreshToken" text,
    "expiryDate" timestamp without time zone,
    "rawTokens" jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."GoogleSheetsTokens" OWNER TO empresa;

--
-- Name: GoogleSheetsTokens_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."GoogleSheetsTokens_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GoogleSheetsTokens_id_seq" OWNER TO empresa;

--
-- Name: GoogleSheetsTokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."GoogleSheetsTokens_id_seq" OWNED BY public."GoogleSheetsTokens".id;


--
-- Name: Helps; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Helps" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    video character varying(255),
    link text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Helps" OWNER TO empresa;

--
-- Name: Helps_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Helps_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Helps_id_seq" OWNER TO empresa;

--
-- Name: Helps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Helps_id_seq" OWNED BY public."Helps".id;


--
-- Name: IaWorkflows; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."IaWorkflows" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "orchestratorPromptId" integer NOT NULL,
    "agentPromptId" integer NOT NULL,
    alias character varying(255) NOT NULL,
    "createdAt" timestamp(6) without time zone NOT NULL,
    "updatedAt" timestamp(6) without time zone NOT NULL
);


ALTER TABLE public."IaWorkflows" OWNER TO empresa;

--
-- Name: IaWorkflows_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."IaWorkflows_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."IaWorkflows_id_seq" OWNER TO empresa;

--
-- Name: IaWorkflows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."IaWorkflows_id_seq" OWNED BY public."IaWorkflows".id;


--
-- Name: Integrations; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Integrations" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "isActive" boolean DEFAULT false,
    token text,
    "foneContact" character varying(255),
    "userLogin" character varying(255),
    "passLogin" character varying(255),
    "finalCurrentMonth" integer,
    "initialCurrentMonth" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Integrations" OWNER TO empresa;

--
-- Name: Integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Integrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Integrations_id_seq" OWNER TO empresa;

--
-- Name: Integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Integrations_id_seq" OWNED BY public."Integrations".id;


--
-- Name: Invoices; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Invoices" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "dueDate" character varying(255),
    detail character varying(255),
    status character varying(255),
    value double precision,
    users integer DEFAULT 0,
    connections integer DEFAULT 0,
    queues integer DEFAULT 0,
    "useWhatsapp" boolean DEFAULT true,
    "useFacebook" boolean DEFAULT true,
    "useInstagram" boolean DEFAULT true,
    "useCampaigns" boolean DEFAULT true,
    "useSchedules" boolean DEFAULT true,
    "useInternalChat" boolean DEFAULT true,
    "useExternalApi" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "linkInvoice" text DEFAULT ''::text
);


ALTER TABLE public."Invoices" OWNER TO empresa;

--
-- Name: Invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Invoices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Invoices_id_seq" OWNER TO empresa;

--
-- Name: Invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Invoices_id_seq" OWNED BY public."Invoices".id;


--
-- Name: Languages; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Languages" (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Languages" OWNER TO empresa;

--
-- Name: Languages_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Languages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Languages_id_seq" OWNER TO empresa;

--
-- Name: Languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Languages_id_seq" OWNED BY public."Languages".id;


--
-- Name: LogTickets; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."LogTickets" (
    id integer NOT NULL,
    "userId" integer,
    "ticketId" integer NOT NULL,
    "queueId" integer,
    type character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."LogTickets" OWNER TO empresa;

--
-- Name: LogTickets_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."LogTickets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LogTickets_id_seq" OWNER TO empresa;

--
-- Name: LogTickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."LogTickets_id_seq" OWNED BY public."LogTickets".id;


--
-- Name: MediaFiles; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."MediaFiles" (
    id integer NOT NULL,
    folder_id integer NOT NULL,
    company_id integer NOT NULL,
    original_name character varying(255) NOT NULL,
    custom_name character varying(255),
    mime_type character varying(128) NOT NULL,
    size bigint NOT NULL,
    storage_path text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."MediaFiles" OWNER TO empresa;

--
-- Name: MediaFiles_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."MediaFiles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MediaFiles_id_seq" OWNER TO empresa;

--
-- Name: MediaFiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."MediaFiles_id_seq" OWNED BY public."MediaFiles".id;


--
-- Name: MediaFolders; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."MediaFolders" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    company_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."MediaFolders" OWNER TO empresa;

--
-- Name: MediaFolders_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."MediaFolders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MediaFolders_id_seq" OWNER TO empresa;

--
-- Name: MediaFolders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."MediaFolders_id_seq" OWNED BY public."MediaFolders".id;


--
-- Name: Messages; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Messages" (
    body text NOT NULL,
    ack integer DEFAULT 0 NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "mediaType" character varying(255),
    "mediaUrl" character varying(255),
    "ticketId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "fromMe" boolean DEFAULT false NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "contactId" integer,
    "companyId" integer,
    "remoteJid" text,
    "dataJson" text,
    participant text,
    "queueId" integer,
    "ticketTrakingId" integer,
    "quotedMsgId" integer,
    wid character varying(255),
    id integer NOT NULL,
    "isPrivate" boolean DEFAULT false,
    "isEdited" boolean DEFAULT false,
    "isForwarded" boolean DEFAULT false,
    "fromAgent" boolean DEFAULT false NOT NULL,
    "userId" integer
);


ALTER TABLE public."Messages" OWNER TO empresa;

--
-- Name: Messages_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Messages_id_seq" OWNER TO empresa;

--
-- Name: Messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Messages_id_seq" OWNED BY public."Messages".id;


--
-- Name: MobileWebhooks; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."MobileWebhooks" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "webhookUrl" character varying(255) NOT NULL,
    "deviceToken" character varying(255) NOT NULL,
    platform public."enum_MobileWebhooks_platform" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "failureCount" integer DEFAULT 0 NOT NULL,
    "lastUsed" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."MobileWebhooks" OWNER TO empresa;

--
-- Name: MobileWebhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."MobileWebhooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MobileWebhooks_id_seq" OWNER TO empresa;

--
-- Name: MobileWebhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."MobileWebhooks_id_seq" OWNED BY public."MobileWebhooks".id;


--
-- Name: Negocios; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Negocios" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "kanbanBoards" jsonb,
    users jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Negocios" OWNER TO empresa;

--
-- Name: Negocios_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Negocios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Negocios_id_seq" OWNER TO empresa;

--
-- Name: Negocios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Negocios_id_seq" OWNED BY public."Negocios".id;


--
-- Name: Partners; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Partners" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    document character varying(255),
    commission numeric(10,2) NOT NULL,
    "typeCommission" character varying(255) NOT NULL,
    "walletId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Partners" OWNER TO empresa;

--
-- Name: Partners_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Partners_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Partners_id_seq" OWNER TO empresa;

--
-- Name: Partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Partners_id_seq" OWNED BY public."Partners".id;


--
-- Name: Plans; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Plans" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    users integer DEFAULT 0,
    connections integer DEFAULT 0,
    queues integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    amount character varying(255),
    "useFacebook" boolean DEFAULT true,
    "useInstagram" boolean DEFAULT true,
    "useWhatsapp" boolean DEFAULT true,
    "useCampaigns" boolean DEFAULT true,
    "useExternalApi" boolean DEFAULT true,
    "useInternalChat" boolean DEFAULT true,
    "useSchedules" boolean DEFAULT true,
    "useKanban" boolean DEFAULT true,
    "isPublic" boolean DEFAULT true NOT NULL,
    recurrence character varying(255),
    trial boolean DEFAULT false,
    "trialDays" integer DEFAULT 0,
    "useIntegrations" boolean DEFAULT true,
    "useOpenAi" boolean DEFAULT true,
    "affiliateCommissionRate" numeric(5,2)
);


ALTER TABLE public."Plans" OWNER TO empresa;

--
-- Name: Plans_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Plans_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Plans_id_seq" OWNER TO empresa;

--
-- Name: Plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Plans_id_seq" OWNED BY public."Plans".id;


--
-- Name: ProdutoCategorias; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ProdutoCategorias" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    nome character varying(255) NOT NULL,
    slug character varying(255),
    descricao text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."ProdutoCategorias" OWNER TO empresa;

--
-- Name: ProdutoCategorias_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ProdutoCategorias_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProdutoCategorias_id_seq" OWNER TO empresa;

--
-- Name: ProdutoCategorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ProdutoCategorias_id_seq" OWNED BY public."ProdutoCategorias".id;


--
-- Name: ProdutoVariacaoGrupos; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ProdutoVariacaoGrupos" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    nome character varying(100) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."ProdutoVariacaoGrupos" OWNER TO empresa;

--
-- Name: ProdutoVariacaoGrupos_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ProdutoVariacaoGrupos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProdutoVariacaoGrupos_id_seq" OWNER TO empresa;

--
-- Name: ProdutoVariacaoGrupos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ProdutoVariacaoGrupos_id_seq" OWNED BY public."ProdutoVariacaoGrupos".id;


--
-- Name: ProdutoVariacaoItens; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ProdutoVariacaoItens" (
    id integer NOT NULL,
    "produtoId" integer NOT NULL,
    "opcaoId" integer NOT NULL,
    "valorOverride" numeric(12,2),
    "estoqueOverride" integer,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."ProdutoVariacaoItens" OWNER TO empresa;

--
-- Name: ProdutoVariacaoItens_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ProdutoVariacaoItens_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProdutoVariacaoItens_id_seq" OWNER TO empresa;

--
-- Name: ProdutoVariacaoItens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ProdutoVariacaoItens_id_seq" OWNED BY public."ProdutoVariacaoItens".id;


--
-- Name: ProdutoVariacaoOpcoes; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ProdutoVariacaoOpcoes" (
    id integer NOT NULL,
    "grupoId" integer NOT NULL,
    nome character varying(100) NOT NULL,
    ordem integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."ProdutoVariacaoOpcoes" OWNER TO empresa;

--
-- Name: ProdutoVariacaoOpcoes_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ProdutoVariacaoOpcoes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ProdutoVariacaoOpcoes_id_seq" OWNER TO empresa;

--
-- Name: ProdutoVariacaoOpcoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ProdutoVariacaoOpcoes_id_seq" OWNED BY public."ProdutoVariacaoOpcoes".id;


--
-- Name: Produtos; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Produtos" (
    id integer NOT NULL,
    "companyId" integer,
    tipo character varying(20) NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    valor numeric(12,2),
    status character varying(20) DEFAULT 'disponivel'::character varying,
    imagem_principal text,
    galeria jsonb,
    dados_especificos jsonb,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "categoriaId" integer,
    "controleEstoque" boolean DEFAULT false,
    "estoqueAtual" integer DEFAULT 0,
    "estoqueMinimo" integer DEFAULT 0
);


ALTER TABLE public."Produtos" OWNER TO empresa;

--
-- Name: Produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Produtos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Produtos_id_seq" OWNER TO empresa;

--
-- Name: Produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Produtos_id_seq" OWNED BY public."Produtos".id;


--
-- Name: PromptToolSettings; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."PromptToolSettings" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "promptId" integer,
    "toolName" character varying(255) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PromptToolSettings" OWNER TO empresa;

--
-- Name: PromptToolSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."PromptToolSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PromptToolSettings_id_seq" OWNER TO empresa;

--
-- Name: PromptToolSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."PromptToolSettings_id_seq" OWNED BY public."PromptToolSettings".id;


--
-- Name: Prompts; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Prompts" (
    id integer NOT NULL,
    name text NOT NULL,
    "apiKey" text NOT NULL,
    prompt text NOT NULL,
    "maxTokens" integer DEFAULT 100 NOT NULL,
    "maxMessages" integer DEFAULT 10 NOT NULL,
    temperature integer DEFAULT 1 NOT NULL,
    "promptTokens" integer DEFAULT 0 NOT NULL,
    "completionTokens" integer DEFAULT 0 NOT NULL,
    "totalTokens" integer DEFAULT 0 NOT NULL,
    voice text,
    "voiceKey" text,
    "voiceRegion" text,
    "queueId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    model character varying(255),
    provider character varying(255) DEFAULT 'openai'::character varying,
    "knowledgeBase" jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public."Prompts" OWNER TO empresa;

--
-- Name: Prompts_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Prompts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Prompts_id_seq" OWNER TO empresa;

--
-- Name: Prompts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Prompts_id_seq" OWNED BY public."Prompts".id;


--
-- Name: QueueIntegrations; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."QueueIntegrations" (
    id integer NOT NULL,
    type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "projectName" character varying(255) NOT NULL,
    "jsonContent" text NOT NULL,
    language character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "urlN8N" character varying(255) DEFAULT true NOT NULL,
    "companyId" integer,
    "typebotExpires" integer DEFAULT 0 NOT NULL,
    "typebotKeywordFinish" character varying(255) DEFAULT ''::character varying NOT NULL,
    "typebotUnknownMessage" character varying(255) DEFAULT ''::character varying NOT NULL,
    "typebotSlug" character varying(255) DEFAULT ''::character varying NOT NULL,
    "typebotDelayMessage" integer DEFAULT 1000 NOT NULL,
    "typebotKeywordRestart" character varying(255) DEFAULT ''::character varying,
    "typebotRestartMessage" character varying(255) DEFAULT ''::character varying
);


ALTER TABLE public."QueueIntegrations" OWNER TO empresa;

--
-- Name: QueueIntegrations_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."QueueIntegrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."QueueIntegrations_id_seq" OWNER TO empresa;

--
-- Name: QueueIntegrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."QueueIntegrations_id_seq" OWNED BY public."QueueIntegrations".id;


--
-- Name: QueueOptions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."QueueOptions" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    option text,
    "queueId" integer,
    "parentId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QueueOptions" OWNER TO empresa;

--
-- Name: QueueOptions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."QueueOptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."QueueOptions_id_seq" OWNER TO empresa;

--
-- Name: QueueOptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."QueueOptions_id_seq" OWNED BY public."QueueOptions".id;


--
-- Name: Queues; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Queues" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(255) NOT NULL,
    "greetingMessage" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer,
    schedules jsonb DEFAULT '[]'::jsonb,
    "outOfHoursMessage" text,
    "orderQueue" integer,
    "tempoRoteador" integer DEFAULT 0 NOT NULL,
    "ativarRoteador" boolean DEFAULT false NOT NULL,
    "integrationId" integer,
    "fileListId" integer,
    "closeTicket" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Queues" OWNER TO empresa;

--
-- Name: Queues_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Queues_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Queues_id_seq" OWNER TO empresa;

--
-- Name: Queues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Queues_id_seq" OWNED BY public."Queues".id;


--
-- Name: QuickMessages; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."QuickMessages" (
    id integer NOT NULL,
    shortcode character varying(255) NOT NULL,
    message text,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "mediaPath" character varying(255) DEFAULT NULL::character varying,
    "mediaName" character varying(255) DEFAULT NULL::character varying,
    geral boolean DEFAULT false NOT NULL,
    visao boolean DEFAULT true
);


ALTER TABLE public."QuickMessages" OWNER TO empresa;

--
-- Name: QuickMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."QuickMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."QuickMessages_id_seq" OWNER TO empresa;

--
-- Name: QuickMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."QuickMessages_id_seq" OWNED BY public."QuickMessages".id;


--
-- Name: ScheduledMessages; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ScheduledMessages" (
    id integer NOT NULL,
    data_mensagem_programada timestamp with time zone,
    id_conexao character varying(255),
    intervalo character varying(255),
    valor_intervalo character varying(255),
    mensagem text,
    tipo_dias_envio character varying(255),
    mostrar_usuario_mensagem boolean DEFAULT false,
    criar_ticket boolean DEFAULT false,
    contatos jsonb,
    tags jsonb,
    "companyId" integer,
    nome character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mediaPath" character varying(255),
    "mediaName" character varying(255),
    tipo_arquivo character varying(255),
    usuario_envio character varying(255),
    enviar_quantas_vezes character varying(255)
);


ALTER TABLE public."ScheduledMessages" OWNER TO empresa;

--
-- Name: ScheduledMessagesEnvios; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."ScheduledMessagesEnvios" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mediaPath" character varying(255),
    "mediaName" character varying(255),
    mensagem text,
    "companyId" integer,
    data_envio timestamp with time zone,
    scheduledmessages integer,
    key character varying(255)
);


ALTER TABLE public."ScheduledMessagesEnvios" OWNER TO empresa;

--
-- Name: ScheduledMessagesEnvios_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ScheduledMessagesEnvios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ScheduledMessagesEnvios_id_seq" OWNER TO empresa;

--
-- Name: ScheduledMessagesEnvios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ScheduledMessagesEnvios_id_seq" OWNED BY public."ScheduledMessagesEnvios".id;


--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."ScheduledMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ScheduledMessages_id_seq" OWNER TO empresa;

--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."ScheduledMessages_id_seq" OWNED BY public."ScheduledMessages".id;


--
-- Name: Schedules; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Schedules" (
    id integer NOT NULL,
    body text NOT NULL,
    "sendAt" timestamp with time zone,
    "sentAt" timestamp with time zone,
    "contactId" integer,
    "ticketId" integer,
    "userId" integer,
    "companyId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    status character varying(255),
    "ticketUserId" integer,
    "whatsappId" integer,
    "statusTicket" character varying(255) DEFAULT 'closed'::character varying,
    "queueId" integer,
    "openTicket" character varying(255) DEFAULT 'disabled'::character varying,
    "mediaName" character varying(255) DEFAULT NULL::character varying,
    "mediaPath" character varying(255) DEFAULT NULL::character varying,
    intervalo integer DEFAULT 1,
    "valorIntervalo" integer DEFAULT 0,
    "enviarQuantasVezes" integer DEFAULT 1,
    "tipoDias" integer DEFAULT 4,
    "contadorEnvio" integer DEFAULT 0,
    assinar boolean DEFAULT false,
    "googleEventId" character varying(255)
);


ALTER TABLE public."Schedules" OWNER TO empresa;

--
-- Name: Schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Schedules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Schedules_id_seq" OWNER TO empresa;

--
-- Name: Schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Schedules_id_seq" OWNED BY public."Schedules".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO empresa;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Settings" (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer,
    id integer NOT NULL
);


ALTER TABLE public."Settings" OWNER TO empresa;

--
-- Name: Settings_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Settings_id_seq" OWNER TO empresa;

--
-- Name: Settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Settings_id_seq" OWNED BY public."Settings".id;


--
-- Name: SliderBanners; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."SliderBanners" (
    id integer NOT NULL,
    image text NOT NULL,
    url text,
    "companyId" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    CONSTRAINT slider_company_only_one CHECK (("companyId" = 1))
);


ALTER TABLE public."SliderBanners" OWNER TO empresa;

--
-- Name: SliderBanners_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."SliderBanners_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SliderBanners_id_seq" OWNER TO empresa;

--
-- Name: SliderBanners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."SliderBanners_id_seq" OWNED BY public."SliderBanners".id;


--
-- Name: Subscriptions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Subscriptions" (
    id integer NOT NULL,
    "isActive" boolean DEFAULT false,
    "expiresAt" timestamp with time zone NOT NULL,
    "userPriceCents" integer,
    "whatsPriceCents" integer,
    "lastInvoiceUrl" character varying(255),
    "lastPlanChange" timestamp with time zone,
    "companyId" integer NOT NULL,
    "providerSubscriptionId" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Subscriptions" OWNER TO empresa;

--
-- Name: Subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Subscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Subscriptions_id_seq" OWNER TO empresa;

--
-- Name: Subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Subscriptions_id_seq" OWNED BY public."Subscriptions".id;


--
-- Name: Tags; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Tags" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(255),
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    kanban integer,
    "timeLane" integer DEFAULT 0,
    "nextLaneId" integer,
    "greetingMessageLane" text,
    "rollbackLaneId" integer DEFAULT 0
);


ALTER TABLE public."Tags" OWNER TO empresa;

--
-- Name: Tags_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Tags_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tags_id_seq" OWNER TO empresa;

--
-- Name: Tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Tags_id_seq" OWNED BY public."Tags".id;


--
-- Name: TicketNotes; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."TicketNotes" (
    id integer NOT NULL,
    note character varying(255) NOT NULL,
    "userId" integer,
    "contactId" integer NOT NULL,
    "ticketId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TicketNotes" OWNER TO empresa;

--
-- Name: TicketNotes_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."TicketNotes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TicketNotes_id_seq" OWNER TO empresa;

--
-- Name: TicketNotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."TicketNotes_id_seq" OWNED BY public."TicketNotes".id;


--
-- Name: TicketTags; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."TicketTags" (
    "ticketId" integer NOT NULL,
    "tagId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TicketTags" OWNER TO empresa;

--
-- Name: TicketTraking; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."TicketTraking" (
    id integer NOT NULL,
    "ticketId" integer,
    "companyId" integer,
    "whatsappId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "queuedAt" timestamp with time zone,
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    "ratingAt" timestamp with time zone,
    rated boolean DEFAULT false,
    "closedAt" timestamp with time zone,
    "chatbotAt" timestamp with time zone,
    "queueId" integer
);


ALTER TABLE public."TicketTraking" OWNER TO empresa;

--
-- Name: TicketTraking_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."TicketTraking_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TicketTraking_id_seq" OWNER TO empresa;

--
-- Name: TicketTraking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."TicketTraking_id_seq" OWNED BY public."TicketTraking".id;


--
-- Name: Tickets; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Tickets" (
    id integer NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "lastMessage" text DEFAULT ''::text,
    "contactId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "whatsappId" integer,
    "isGroup" boolean DEFAULT false NOT NULL,
    "unreadMessages" integer,
    "queueId" integer,
    "companyId" integer,
    uuid uuid,
    chatbot boolean DEFAULT false,
    "queueOptionId" integer,
    "isBot" boolean,
    channel text DEFAULT 'whatsapp'::text,
    "amountUsedBotQueues" integer,
    "fromMe" boolean DEFAULT false NOT NULL,
    "amountUsedBotQueuesNPS" integer DEFAULT 0 NOT NULL,
    "sendInactiveMessage" boolean DEFAULT false NOT NULL,
    "lgpdSendMessageAt" timestamp with time zone,
    "lgpdAcceptedAt" timestamp with time zone,
    imported timestamp with time zone,
    "flowWebhook" boolean DEFAULT false NOT NULL,
    "lastFlowId" character varying(255),
    "dataWebhook" json,
    "hashFlowId" character varying(255),
    "useIntegration" boolean DEFAULT false,
    "integrationId" integer,
    "isOutOfHour" boolean DEFAULT false,
    "flowStopped" character varying(255),
    "isActiveDemand" boolean DEFAULT false,
    "typebotSessionId" character varying(255) DEFAULT NULL::character varying,
    "typebotStatus" boolean DEFAULT false NOT NULL,
    "typebotSessionTime" timestamp with time zone,
    "productsSent" jsonb DEFAULT '[]'::jsonb NOT NULL,
    crm_lead_id bigint,
    crm_client_id bigint,
    "leadValue" numeric(10,2),
    lid character varying,
    "waitingQuestion" boolean DEFAULT false,
    "questionNodeId" character varying(255),
    "questionOptions" jsonb,
    "timeoutEnabled" boolean DEFAULT false,
    "timeoutAt" timestamp without time zone
);


ALTER TABLE public."Tickets" OWNER TO empresa;

--
-- Name: Tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Tickets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tickets_id_seq" OWNER TO empresa;

--
-- Name: Tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Tickets_id_seq" OWNED BY public."Tickets".id;


--
-- Name: Translations; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Translations" (
    id integer NOT NULL,
    "languageCode" character varying(255) NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Translations" OWNER TO empresa;

--
-- Name: Translations_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Translations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Translations_id_seq" OWNER TO empresa;

--
-- Name: Translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Translations_id_seq" OWNED BY public."Translations".id;


--
-- Name: UserDevices; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."UserDevices" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "deviceToken" text NOT NULL,
    platform character varying(10) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "UserDevices_platform_check" CHECK (((platform)::text = ANY (ARRAY[('ios'::character varying)::text, ('android'::character varying)::text])))
);


ALTER TABLE public."UserDevices" OWNER TO empresa;

--
-- Name: UserDevices_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."UserDevices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserDevices_id_seq" OWNER TO empresa;

--
-- Name: UserDevices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."UserDevices_id_seq" OWNED BY public."UserDevices".id;


--
-- Name: UserGoogleCalendarIntegrations; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."UserGoogleCalendarIntegrations" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    company_id integer NOT NULL,
    "googleUserId" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "accessToken" text NOT NULL,
    "refreshToken" text NOT NULL,
    "expiryDate" timestamp without time zone,
    "calendarId" character varying(255) DEFAULT 'primary'::character varying NOT NULL,
    active boolean DEFAULT true,
    "syncToken" text,
    "lastSyncAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserGoogleCalendarIntegrations" OWNER TO empresa;

--
-- Name: TABLE "UserGoogleCalendarIntegrations"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON TABLE public."UserGoogleCalendarIntegrations" IS 'Tabela de integrações individuais do Google Calendar por usuário';


--
-- Name: UserGoogleCalendarIntegrations_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."UserGoogleCalendarIntegrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserGoogleCalendarIntegrations_id_seq" OWNER TO empresa;

--
-- Name: UserGoogleCalendarIntegrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."UserGoogleCalendarIntegrations_id_seq" OWNED BY public."UserGoogleCalendarIntegrations".id;


--
-- Name: UserPagePermissions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."UserPagePermissions" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "pagePath" character varying(255) NOT NULL,
    "canAccess" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."UserPagePermissions" OWNER TO empresa;

--
-- Name: TABLE "UserPagePermissions"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON TABLE public."UserPagePermissions" IS 'Tabela para armazenar permissões de acesso a páginas por usuário';


--
-- Name: COLUMN "UserPagePermissions"."userId"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public."UserPagePermissions"."userId" IS 'ID do usuário';


--
-- Name: COLUMN "UserPagePermissions"."pagePath"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public."UserPagePermissions"."pagePath" IS 'Caminho da página (ex: /atendimentos, /users)';


--
-- Name: COLUMN "UserPagePermissions"."canAccess"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public."UserPagePermissions"."canAccess" IS 'Indica se o usuário tem acesso à página';


--
-- Name: COLUMN "UserPagePermissions"."createdAt"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public."UserPagePermissions"."createdAt" IS 'Data de criação do registro';


--
-- Name: COLUMN "UserPagePermissions"."updatedAt"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public."UserPagePermissions"."updatedAt" IS 'Data de atualização do registro';


--
-- Name: UserPagePermissions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."UserPagePermissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserPagePermissions_id_seq" OWNER TO empresa;

--
-- Name: UserPagePermissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."UserPagePermissions_id_seq" OWNED BY public."UserPagePermissions".id;


--
-- Name: UserQueues; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."UserQueues" (
    "userId" integer NOT NULL,
    "queueId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserQueues" OWNER TO empresa;

--
-- Name: UserRatings; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."UserRatings" (
    id integer NOT NULL,
    "ticketId" integer,
    "companyId" integer,
    "userId" integer,
    rate integer DEFAULT 0,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."UserRatings" OWNER TO empresa;

--
-- Name: UserRatings_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."UserRatings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserRatings_id_seq" OWNER TO empresa;

--
-- Name: UserRatings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."UserRatings_id_seq" OWNED BY public."UserRatings".id;


--
-- Name: UserServices; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."UserServices" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "serviceId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."UserServices" OWNER TO empresa;

--
-- Name: UserServices_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."UserServices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserServices_id_seq" OWNER TO empresa;

--
-- Name: UserServices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."UserServices_id_seq" OWNED BY public."UserServices".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    profile character varying(255) DEFAULT 'admin'::character varying NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "companyId" integer,
    super boolean DEFAULT false,
    online boolean DEFAULT false,
    "endWork" character varying(255) DEFAULT '23:59'::character varying,
    "startWork" character varying(255) DEFAULT '00:00'::character varying,
    color character varying(255),
    "farewellMessage" text,
    "whatsappId" integer,
    "allTicket" character varying(255) DEFAULT 'disable'::character varying NOT NULL,
    "allowGroup" boolean DEFAULT false NOT NULL,
    "defaultMenu" character varying(255) DEFAULT 'closed'::character varying NOT NULL,
    "defaultTheme" character varying(255) DEFAULT 'light'::character varying NOT NULL,
    "profileImage" character varying(255),
    "allHistoric" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "allUserChat" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "resetPassword" character varying(255),
    "userClosePendingTicket" character varying(255) DEFAULT 'enabled'::character varying NOT NULL,
    "showDashboard" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "defaultTicketsManagerWidth" integer DEFAULT 550 NOT NULL,
    "allowRealTime" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "allowConnections" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "userType" character varying(255) DEFAULT 'attendant'::character varying,
    "workDays" character varying(255) DEFAULT '1,2,3,4,5'::character varying,
    "lunchStart" character varying(255) DEFAULT NULL::character varying,
    "lunchEnd" character varying(255) DEFAULT NULL::character varying,
    "twoFactorSecret" character varying(255),
    "twoFactorEnabled" boolean DEFAULT false,
    "pagePermissionsMode" character varying(20) DEFAULT 'inherit'::character varying NOT NULL,
    CONSTRAINT chk_users_page_permissions_mode CHECK ((("pagePermissionsMode")::text = ANY ((ARRAY['inherit'::character varying, 'custom'::character varying])::text[])))
);


ALTER TABLE public."Users" OWNER TO empresa;

--
-- Name: COLUMN "Users"."pagePermissionsMode"; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public."Users"."pagePermissionsMode" IS 'Modo de permissões de páginas: inherit (herdar do perfil) ou custom (personalizadas)';


--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Users_id_seq" OWNER TO empresa;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Versions; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Versions" (
    id integer NOT NULL,
    "versionFrontend" text NOT NULL,
    "versionBackend" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Versions" OWNER TO empresa;

--
-- Name: Versions_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Versions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Versions_id_seq" OWNER TO empresa;

--
-- Name: Versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Versions_id_seq" OWNED BY public."Versions".id;


--
-- Name: Webhooks; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Webhooks" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    hash_id character varying(255) NOT NULL,
    config json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    active boolean DEFAULT false,
    "requestMonth" integer DEFAULT 0,
    "requestAll" integer DEFAULT 0,
    company_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Webhooks" OWNER TO empresa;

--
-- Name: Webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Webhooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Webhooks_id_seq" OWNER TO empresa;

--
-- Name: Webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Webhooks_id_seq" OWNED BY public."Webhooks".id;


--
-- Name: WhatsappQueues; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."WhatsappQueues" (
    "whatsappId" integer NOT NULL,
    "queueId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."WhatsappQueues" OWNER TO empresa;

--
-- Name: Whatsapps; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public."Whatsapps" (
    id integer NOT NULL,
    session text,
    qrcode text,
    status character varying(255),
    battery character varying(255),
    plugged boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    retries integer DEFAULT 0 NOT NULL,
    "greetingMessage" text,
    "companyId" integer,
    "complationMessage" text,
    "outOfHoursMessage" text,
    token text,
    "farewellMessage" text,
    provider text DEFAULT 'stable'::text,
    number text,
    channel text,
    "facebookUserToken" text,
    "tokenMeta" text,
    "facebookPageUserId" text,
    "facebookUserId" text,
    "maxUseBotQueues" integer,
    "expiresTicket" integer DEFAULT 0,
    "allowGroup" boolean DEFAULT false NOT NULL,
    "timeUseBotQueues" character varying(255) DEFAULT '0'::character varying NOT NULL,
    "timeSendQueue" integer,
    "sendIdQueue" integer,
    "expiresInactiveMessage" text,
    "maxUseBotQueuesNPS" integer DEFAULT 0,
    "inactiveMessage" character varying(255) DEFAULT ''::character varying,
    "whenExpiresTicket" character varying(255) DEFAULT ''::character varying,
    "expiresTicketNPS" character varying(255) DEFAULT ''::character varying,
    "timeInactiveMessage" character varying(255) DEFAULT ''::character varying,
    "ratingMessage" text,
    "groupAsTicket" character varying(255) DEFAULT 'disabled'::character varying NOT NULL,
    "importOldMessages" text,
    "importRecentMessages" text,
    "statusImportMessages" character varying(255),
    "closedTicketsPostImported" boolean,
    "importOldMessagesGroups" boolean,
    "timeCreateNewTicket" integer,
    "greetingMediaAttachment" character varying(255) DEFAULT NULL::character varying,
    "promptId" integer,
    "integrationId" integer,
    schedules jsonb DEFAULT '[]'::jsonb,
    "collectiveVacationEnd" character varying(255) DEFAULT NULL::character varying,
    "collectiveVacationStart" character varying(255) DEFAULT NULL::character varying,
    "collectiveVacationMessage" text,
    "queueIdImportMessages" integer,
    "flowIdNotPhrase" integer,
    "flowIdWelcome" integer,
    wavoip text,
    "notificameHub" boolean DEFAULT false NOT NULL,
    "coexistencePhoneNumberId" text,
    "coexistenceWabaId" text,
    "coexistencePermanentToken" text,
    "coexistenceEnabled" boolean DEFAULT false NOT NULL,
    "businessAppConnected" boolean DEFAULT false NOT NULL,
    "messageRoutingMode" character varying(255) DEFAULT 'automatic'::character varying NOT NULL,
    "routingRules" jsonb,
    "lastCoexistenceSync" timestamp without time zone
);


ALTER TABLE public."Whatsapps" OWNER TO empresa;

--
-- Name: Whatsapps_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public."Whatsapps_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Whatsapps_id_seq" OWNER TO empresa;

--
-- Name: Whatsapps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public."Whatsapps_id_seq" OWNED BY public."Whatsapps".id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    start_datetime timestamp without time zone NOT NULL,
    duration_minutes integer DEFAULT 60,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    schedule_id integer NOT NULL,
    service_id integer,
    client_id integer,
    contact_id integer,
    company_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    google_event_id character varying(255)
);


ALTER TABLE public.appointments OWNER TO empresa;

--
-- Name: COLUMN appointments.google_event_id; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public.appointments.google_event_id IS 'ID do evento correspondente no Google Calendar';


--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.appointments_id_seq OWNER TO empresa;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: company_api_keys; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.company_api_keys (
    id integer NOT NULL,
    company_id integer NOT NULL,
    label character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    webhook_url character varying(255),
    webhook_secret character varying(255),
    active boolean DEFAULT true NOT NULL,
    last_used_at timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_api_keys OWNER TO empresa;

--
-- Name: company_api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.company_api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_api_keys_id_seq OWNER TO empresa;

--
-- Name: company_api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.company_api_keys_id_seq OWNED BY public.company_api_keys.id;


--
-- Name: company_integration_field_maps; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.company_integration_field_maps (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    external_field character varying(255) NOT NULL,
    crm_field character varying(255),
    transform_expression text,
    options jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_integration_field_maps OWNER TO empresa;

--
-- Name: company_integration_field_maps_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.company_integration_field_maps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_integration_field_maps_id_seq OWNER TO empresa;

--
-- Name: company_integration_field_maps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.company_integration_field_maps_id_seq OWNED BY public.company_integration_field_maps.id;


--
-- Name: company_integration_settings; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.company_integration_settings (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    provider character varying(255),
    base_url character varying(255),
    api_key text,
    api_secret text,
    webhook_secret text,
    metadata jsonb,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_integration_settings OWNER TO empresa;

--
-- Name: company_integration_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.company_integration_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_integration_settings_id_seq OWNER TO empresa;

--
-- Name: company_integration_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.company_integration_settings_id_seq OWNED BY public.company_integration_settings.id;


--
-- Name: company_payment_settings; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.company_payment_settings (
    id integer NOT NULL,
    company_id integer NOT NULL,
    provider character varying(255) NOT NULL,
    token text NOT NULL,
    additional_data jsonb,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_payment_settings OWNER TO empresa;

--
-- Name: company_payment_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.company_payment_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_payment_settings_id_seq OWNER TO empresa;

--
-- Name: company_payment_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.company_payment_settings_id_seq OWNED BY public.company_payment_settings.id;


--
-- Name: crm_client_contacts; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.crm_client_contacts (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    contact_id bigint NOT NULL,
    role character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.crm_client_contacts OWNER TO empresa;

--
-- Name: crm_client_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.crm_client_contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crm_client_contacts_id_seq OWNER TO empresa;

--
-- Name: crm_client_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.crm_client_contacts_id_seq OWNED BY public.crm_client_contacts.id;


--
-- Name: crm_clients; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.crm_clients (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    type character varying(20) DEFAULT 'pf'::character varying NOT NULL,
    name character varying(150) NOT NULL,
    company_name character varying(150),
    document character varying(30),
    birth_date date,
    email character varying(150),
    phone character varying(30),
    zip_code character varying(15),
    address character varying(150),
    number character varying(20),
    complement character varying(100),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(2),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    client_since date,
    owner_user_id bigint,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    contact_id bigint,
    primary_ticket_id bigint,
    asaas_customer_id character varying(255),
    lid character varying
);


ALTER TABLE public.crm_clients OWNER TO empresa;

--
-- Name: crm_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.crm_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crm_clients_id_seq OWNER TO empresa;

--
-- Name: crm_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.crm_clients_id_seq OWNED BY public.crm_clients.id;


--
-- Name: crm_leads; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.crm_leads (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(150),
    phone character varying(30),
    birth_date date,
    document character varying(30),
    company_name character varying(150),
    "position" character varying(100),
    source character varying(60),
    campaign character varying(100),
    medium character varying(50),
    status character varying(30) DEFAULT 'new'::character varying NOT NULL,
    score integer DEFAULT 0,
    temperature character varying(20),
    owner_user_id bigint,
    notes text,
    last_activity_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    contact_id bigint,
    primary_ticket_id bigint,
    converted_client_id bigint,
    converted_at timestamp with time zone,
    lead_status character varying(32) DEFAULT 'novo'::character varying,
    lid character varying(255)
);


ALTER TABLE public.crm_leads OWNER TO empresa;

--
-- Name: crm_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.crm_leads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crm_leads_id_seq OWNER TO empresa;

--
-- Name: crm_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.crm_leads_id_seq OWNED BY public.crm_leads.id;


--
-- Name: financeiro_faturas; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.financeiro_faturas (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    client_id bigint NOT NULL,
    descricao character varying(255) NOT NULL,
    valor numeric(14,2) NOT NULL,
    status character varying(20) DEFAULT 'aberta'::character varying NOT NULL,
    data_vencimento date NOT NULL,
    data_pagamento timestamp with time zone,
    tipo_referencia character varying(20),
    referencia_id bigint,
    tipo_recorrencia character varying(20) DEFAULT 'unica'::character varying NOT NULL,
    quantidade_ciclos integer,
    ciclo_atual integer DEFAULT 1 NOT NULL,
    data_inicio date DEFAULT CURRENT_DATE NOT NULL,
    data_fim date,
    ativa boolean DEFAULT true NOT NULL,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    valor_pago numeric(14,2) DEFAULT 0 NOT NULL,
    payment_provider character varying(255),
    payment_link text,
    payment_external_id character varying(255),
    checkout_token character varying(64),
    project_id integer,
    CONSTRAINT chk_financeiro_faturas_referencia CHECK ((((tipo_referencia IS NULL) AND (referencia_id IS NULL)) OR ((tipo_referencia IS NOT NULL) AND (referencia_id IS NOT NULL)))),
    CONSTRAINT chk_recorrencia CHECK ((((tipo_recorrencia)::text = 'unica'::text) OR (((tipo_recorrencia)::text = ANY (ARRAY[('mensal'::character varying)::text, ('anual'::character varying)::text])) AND (data_inicio IS NOT NULL)))),
    CONSTRAINT chk_referencia_opcional CHECK ((((tipo_referencia IS NULL) AND (referencia_id IS NULL)) OR ((tipo_referencia IS NOT NULL) AND (referencia_id IS NOT NULL))))
);


ALTER TABLE public.financeiro_faturas OWNER TO empresa;

--
-- Name: financeiro_faturas_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.financeiro_faturas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.financeiro_faturas_id_seq OWNER TO empresa;

--
-- Name: financeiro_faturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.financeiro_faturas_id_seq OWNED BY public.financeiro_faturas.id;


--
-- Name: financeiro_pagamentos; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.financeiro_pagamentos (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    fatura_id bigint NOT NULL,
    metodo_pagamento character varying(20) NOT NULL,
    valor numeric(14,2) NOT NULL,
    data_pagamento timestamp without time zone DEFAULT now() NOT NULL,
    observacoes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financeiro_pagamentos OWNER TO empresa;

--
-- Name: financeiro_pagamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.financeiro_pagamentos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.financeiro_pagamentos_id_seq OWNER TO empresa;

--
-- Name: financeiro_pagamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.financeiro_pagamentos_id_seq OWNED BY public.financeiro_pagamentos.id;


--
-- Name: media_files; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.media_files (
    id integer NOT NULL,
    folder_id integer NOT NULL,
    company_id integer NOT NULL,
    original_name character varying(255) NOT NULL,
    custom_name character varying(255),
    mime_type character varying(255) NOT NULL,
    size bigint NOT NULL,
    storage_path text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.media_files OWNER TO empresa;

--
-- Name: media_files_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.media_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_files_id_seq OWNER TO empresa;

--
-- Name: media_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.media_files_id_seq OWNED BY public.media_files.id;


--
-- Name: media_folders; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.media_folders (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    company_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.media_folders OWNER TO empresa;

--
-- Name: media_folders_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.media_folders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_folders_id_seq OWNER TO empresa;

--
-- Name: media_folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.media_folders_id_seq OWNED BY public.media_folders.id;


--
-- Name: profissionais; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.profissionais (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    nome character varying(255) NOT NULL,
    servicos jsonb DEFAULT '[]'::jsonb NOT NULL,
    agenda jsonb DEFAULT '{}'::jsonb NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    comissao numeric(10,2) DEFAULT 0 NOT NULL,
    "valorEmAberto" numeric(12,2) DEFAULT 0 NOT NULL,
    "valoresRecebidos" numeric(12,2) DEFAULT 0 NOT NULL,
    "valoresAReceber" numeric(12,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profissionais OWNER TO empresa;

--
-- Name: profissionais_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.profissionais_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profissionais_id_seq OWNER TO empresa;

--
-- Name: profissionais_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.profissionais_id_seq OWNED BY public.profissionais.id;


--
-- Name: project_products; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.project_products (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer DEFAULT 1,
    "unitPrice" numeric(10,2),
    notes text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_products OWNER TO empresa;

--
-- Name: project_products_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.project_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_products_id_seq OWNER TO empresa;

--
-- Name: project_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.project_products_id_seq OWNED BY public.project_products.id;


--
-- Name: project_services; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.project_services (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "serviceId" integer NOT NULL,
    quantity integer DEFAULT 1,
    "unitPrice" numeric(10,2),
    notes text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_services OWNER TO empresa;

--
-- Name: project_services_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.project_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_services_id_seq OWNER TO empresa;

--
-- Name: project_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.project_services_id_seq OWNED BY public.project_services.id;


--
-- Name: project_task_users; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.project_task_users (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "taskId" integer NOT NULL,
    "userId" integer NOT NULL,
    responsibility character varying(255),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_task_users OWNER TO empresa;

--
-- Name: project_task_users_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.project_task_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_task_users_id_seq OWNER TO empresa;

--
-- Name: project_task_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.project_task_users_id_seq OWNED BY public.project_task_users.id;


--
-- Name: project_tasks; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.project_tasks (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "projectId" integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'pending'::character varying,
    "order" integer DEFAULT 0,
    "startDate" timestamp with time zone,
    "dueDate" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_tasks OWNER TO empresa;

--
-- Name: project_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.project_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_tasks_id_seq OWNER TO empresa;

--
-- Name: project_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.project_tasks_id_seq OWNED BY public.project_tasks.id;


--
-- Name: project_users; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.project_users (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "userId" integer NOT NULL,
    role character varying(100),
    "effortAllocation" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_users OWNER TO empresa;

--
-- Name: project_users_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.project_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_users_id_seq OWNER TO empresa;

--
-- Name: project_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.project_users_id_seq OWNED BY public.project_users.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "clientId" integer,
    "invoiceId" integer,
    name character varying(255) NOT NULL,
    description text,
    "deliveryTime" timestamp with time zone,
    warranty text,
    terms text,
    status character varying(50) DEFAULT 'draft'::character varying,
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.projects OWNER TO empresa;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO empresa;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: scheduled_dispatch_logs; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.scheduled_dispatch_logs (
    id integer NOT NULL,
    dispatcher_id integer NOT NULL,
    contact_id integer,
    ticket_id integer,
    company_id integer NOT NULL,
    status character varying(32) NOT NULL,
    error_message text,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.scheduled_dispatch_logs OWNER TO empresa;

--
-- Name: scheduled_dispatch_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.scheduled_dispatch_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scheduled_dispatch_logs_id_seq OWNER TO empresa;

--
-- Name: scheduled_dispatch_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.scheduled_dispatch_logs_id_seq OWNED BY public.scheduled_dispatch_logs.id;


--
-- Name: scheduled_dispatchers; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.scheduled_dispatchers (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message_template text NOT NULL,
    event_type character varying(32) NOT NULL,
    whatsapp_id integer,
    start_time character(5) DEFAULT '08:00'::bpchar NOT NULL,
    send_interval_seconds integer DEFAULT 30 NOT NULL,
    days_before_due integer,
    days_after_due integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.scheduled_dispatchers OWNER TO empresa;

--
-- Name: scheduled_dispatchers_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.scheduled_dispatchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scheduled_dispatchers_id_seq OWNER TO empresa;

--
-- Name: scheduled_dispatchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.scheduled_dispatchers_id_seq OWNED BY public.scheduled_dispatchers.id;


--
-- Name: servicos; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.servicos (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    "valorOriginal" numeric(10,2) DEFAULT 0 NOT NULL,
    "possuiDesconto" boolean DEFAULT false NOT NULL,
    "valorComDesconto" numeric(10,2),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.servicos OWNER TO empresa;

--
-- Name: servicos_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.servicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.servicos_id_seq OWNER TO empresa;

--
-- Name: servicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.servicos_id_seq OWNED BY public.servicos.id;


--
-- Name: slider_home; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.slider_home (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    image text NOT NULL,
    "companyId" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT slider_home_company_only_one CHECK (("companyId" = 1))
);


ALTER TABLE public.slider_home OWNER TO empresa;

--
-- Name: slider_home_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.slider_home_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.slider_home_id_seq OWNER TO empresa;

--
-- Name: slider_home_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.slider_home_id_seq OWNED BY public.slider_home.id;


--
-- Name: tutorial_videos; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.tutorial_videos (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    video_url character varying(500) NOT NULL,
    thumbnail_url character varying(500),
    company_id integer NOT NULL,
    user_id integer NOT NULL,
    is_active boolean DEFAULT true,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tutorial_videos_description_check CHECK ((char_length(description) <= 300))
);


ALTER TABLE public.tutorial_videos OWNER TO empresa;

--
-- Name: tutorial_videos_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.tutorial_videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tutorial_videos_id_seq OWNER TO empresa;

--
-- Name: tutorial_videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.tutorial_videos_id_seq OWNED BY public.tutorial_videos.id;


--
-- Name: user_schedules; Type: TABLE; Schema: public; Owner: empresa
--

CREATE TABLE public.user_schedules (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    active boolean DEFAULT true,
    user_id integer NOT NULL,
    company_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    user_google_calendar_integration_id integer
);


ALTER TABLE public.user_schedules OWNER TO empresa;

--
-- Name: COLUMN user_schedules.user_google_calendar_integration_id; Type: COMMENT; Schema: public; Owner: empresa
--

COMMENT ON COLUMN public.user_schedules.user_google_calendar_integration_id IS 'ID da integração Google Calendar vinculada a esta agenda';


--
-- Name: user_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: empresa
--

CREATE SEQUENCE public.user_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_schedules_id_seq OWNER TO empresa;

--
-- Name: user_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: empresa
--

ALTER SEQUENCE public.user_schedules_id_seq OWNED BY public.user_schedules.id;


--
-- Name: AffiliateCommissions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateCommissions" ALTER COLUMN id SET DEFAULT nextval('public."AffiliateCommissions_id_seq"'::regclass);


--
-- Name: AffiliateLinks id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateLinks" ALTER COLUMN id SET DEFAULT nextval('public."AffiliateLinks_id_seq"'::regclass);


--
-- Name: AffiliateWithdrawals id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateWithdrawals" ALTER COLUMN id SET DEFAULT nextval('public."AffiliateWithdrawals_id_seq"'::regclass);


--
-- Name: Affiliates id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Affiliates" ALTER COLUMN id SET DEFAULT nextval('public."Affiliates_id_seq"'::regclass);


--
-- Name: Announcements id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Announcements" ALTER COLUMN id SET DEFAULT nextval('public."Announcements_id_seq"'::regclass);


--
-- Name: ApiUsages id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ApiUsages" ALTER COLUMN id SET DEFAULT nextval('public."ApiUsages_id_seq"'::regclass);


--
-- Name: AutomationActions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationActions" ALTER COLUMN id SET DEFAULT nextval('public."AutomationActions_id_seq"'::regclass);


--
-- Name: AutomationExecutions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationExecutions" ALTER COLUMN id SET DEFAULT nextval('public."AutomationExecutions_id_seq"'::regclass);


--
-- Name: AutomationLogs id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationLogs" ALTER COLUMN id SET DEFAULT nextval('public."AutomationLogs_id_seq"'::regclass);


--
-- Name: Automations id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Automations" ALTER COLUMN id SET DEFAULT nextval('public."Automations_id_seq"'::regclass);


--
-- Name: Baileys id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Baileys" ALTER COLUMN id SET DEFAULT nextval('public."Baileys_id_seq"'::regclass);


--
-- Name: CallRecords id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CallRecords" ALTER COLUMN id SET DEFAULT nextval('public."CallRecords_id_seq"'::regclass);


--
-- Name: CampaignSettings id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CampaignSettings" ALTER COLUMN id SET DEFAULT nextval('public."CampaignSettings_id_seq"'::regclass);


--
-- Name: CampaignShipping id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CampaignShipping" ALTER COLUMN id SET DEFAULT nextval('public."CampaignShipping_id_seq"'::regclass);


--
-- Name: Campaigns id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Campaigns" ALTER COLUMN id SET DEFAULT nextval('public."Campaigns_id_seq"'::regclass);


--
-- Name: ChatMessages id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatMessages" ALTER COLUMN id SET DEFAULT nextval('public."ChatMessages_id_seq"'::regclass);


--
-- Name: ChatUsers id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatUsers" ALTER COLUMN id SET DEFAULT nextval('public."ChatUsers_id_seq"'::regclass);


--
-- Name: Chatbots id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots" ALTER COLUMN id SET DEFAULT nextval('public."Chatbots_id_seq"'::regclass);


--
-- Name: Chats id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chats" ALTER COLUMN id SET DEFAULT nextval('public."Chats_id_seq"'::regclass);


--
-- Name: Companies id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies" ALTER COLUMN id SET DEFAULT nextval('public."Companies_id_seq"'::regclass);


--
-- Name: CompaniesSettings id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CompaniesSettings" ALTER COLUMN id SET DEFAULT nextval('public."CompaniesSettings_id_seq"'::regclass);


--
-- Name: ContactCustomFields id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactCustomFields" ALTER COLUMN id SET DEFAULT nextval('public."ContactCustomFields_id_seq"'::regclass);


--
-- Name: ContactGroups id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactGroups" ALTER COLUMN id SET DEFAULT nextval('public."ContactGroups_id_seq"'::regclass);


--
-- Name: ContactListItems id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactListItems" ALTER COLUMN id SET DEFAULT nextval('public."ContactListItems_id_seq"'::regclass);


--
-- Name: ContactLists id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactLists" ALTER COLUMN id SET DEFAULT nextval('public."ContactLists_id_seq"'::regclass);


--
-- Name: ContactWallets id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactWallets" ALTER COLUMN id SET DEFAULT nextval('public."ContactWallets_id_seq"'::regclass);


--
-- Name: Contacts id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Contacts" ALTER COLUMN id SET DEFAULT nextval('public."Contacts_id_seq"'::regclass);


--
-- Name: Coupons id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Coupons" ALTER COLUMN id SET DEFAULT nextval('public."Coupons_id_seq"'::regclass);


--
-- Name: DialogChatBots id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."DialogChatBots" ALTER COLUMN id SET DEFAULT nextval('public."DialogChatBots_id_seq"'::regclass);


--
-- Name: Faturas id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Faturas" ALTER COLUMN id SET DEFAULT nextval('public."Faturas_id_seq"'::regclass);


--
-- Name: Ferramentas id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Ferramentas" ALTER COLUMN id SET DEFAULT nextval('public."Ferramentas_id_seq"'::regclass);


--
-- Name: Files id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Files" ALTER COLUMN id SET DEFAULT nextval('public."Files_id_seq"'::regclass);


--
-- Name: FilesOptions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FilesOptions" ALTER COLUMN id SET DEFAULT nextval('public."FilesOptions_id_seq"'::regclass);


--
-- Name: FlowAudios id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowAudios" ALTER COLUMN id SET DEFAULT nextval('public."FlowAudios_id_seq"'::regclass);


--
-- Name: FlowBuilders id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowBuilders" ALTER COLUMN id SET DEFAULT nextval('public."FlowBuilders_id_seq"'::regclass);


--
-- Name: FlowCampaigns id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowCampaigns" ALTER COLUMN id SET DEFAULT nextval('public."FlowCampaigns_id_seq"'::regclass);


--
-- Name: FlowDefaults id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowDefaults" ALTER COLUMN id SET DEFAULT nextval('public."FlowDefaults_id_seq"'::regclass);


--
-- Name: FlowImgs id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowImgs" ALTER COLUMN id SET DEFAULT nextval('public."FlowImgs_id_seq"'::regclass);


--
-- Name: GoogleCalendarIntegrations id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleCalendarIntegrations" ALTER COLUMN id SET DEFAULT nextval('public."GoogleCalendarIntegrations_id_seq"'::regclass);


--
-- Name: GoogleSheetsTokens id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleSheetsTokens" ALTER COLUMN id SET DEFAULT nextval('public."GoogleSheetsTokens_id_seq"'::regclass);


--
-- Name: Helps id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Helps" ALTER COLUMN id SET DEFAULT nextval('public."Helps_id_seq"'::regclass);


--
-- Name: IaWorkflows id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."IaWorkflows" ALTER COLUMN id SET DEFAULT nextval('public."IaWorkflows_id_seq"'::regclass);


--
-- Name: Integrations id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Integrations" ALTER COLUMN id SET DEFAULT nextval('public."Integrations_id_seq"'::regclass);


--
-- Name: Invoices id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Invoices" ALTER COLUMN id SET DEFAULT nextval('public."Invoices_id_seq"'::regclass);


--
-- Name: Languages id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Languages" ALTER COLUMN id SET DEFAULT nextval('public."Languages_id_seq"'::regclass);


--
-- Name: LogTickets id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."LogTickets" ALTER COLUMN id SET DEFAULT nextval('public."LogTickets_id_seq"'::regclass);


--
-- Name: MediaFiles id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MediaFiles" ALTER COLUMN id SET DEFAULT nextval('public."MediaFiles_id_seq"'::regclass);


--
-- Name: MediaFolders id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MediaFolders" ALTER COLUMN id SET DEFAULT nextval('public."MediaFolders_id_seq"'::regclass);


--
-- Name: Messages id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages" ALTER COLUMN id SET DEFAULT nextval('public."Messages_id_seq"'::regclass);


--
-- Name: MobileWebhooks id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MobileWebhooks" ALTER COLUMN id SET DEFAULT nextval('public."MobileWebhooks_id_seq"'::regclass);


--
-- Name: Negocios id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Negocios" ALTER COLUMN id SET DEFAULT nextval('public."Negocios_id_seq"'::regclass);


--
-- Name: Partners id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Partners" ALTER COLUMN id SET DEFAULT nextval('public."Partners_id_seq"'::regclass);


--
-- Name: Plans id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Plans" ALTER COLUMN id SET DEFAULT nextval('public."Plans_id_seq"'::regclass);


--
-- Name: ProdutoCategorias id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoCategorias" ALTER COLUMN id SET DEFAULT nextval('public."ProdutoCategorias_id_seq"'::regclass);


--
-- Name: ProdutoVariacaoGrupos id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoGrupos" ALTER COLUMN id SET DEFAULT nextval('public."ProdutoVariacaoGrupos_id_seq"'::regclass);


--
-- Name: ProdutoVariacaoItens id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoItens" ALTER COLUMN id SET DEFAULT nextval('public."ProdutoVariacaoItens_id_seq"'::regclass);


--
-- Name: ProdutoVariacaoOpcoes id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoOpcoes" ALTER COLUMN id SET DEFAULT nextval('public."ProdutoVariacaoOpcoes_id_seq"'::regclass);


--
-- Name: Produtos id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Produtos" ALTER COLUMN id SET DEFAULT nextval('public."Produtos_id_seq"'::regclass);


--
-- Name: PromptToolSettings id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."PromptToolSettings" ALTER COLUMN id SET DEFAULT nextval('public."PromptToolSettings_id_seq"'::regclass);


--
-- Name: Prompts id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Prompts" ALTER COLUMN id SET DEFAULT nextval('public."Prompts_id_seq"'::regclass);


--
-- Name: QueueIntegrations id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueIntegrations" ALTER COLUMN id SET DEFAULT nextval('public."QueueIntegrations_id_seq"'::regclass);


--
-- Name: QueueOptions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueOptions" ALTER COLUMN id SET DEFAULT nextval('public."QueueOptions_id_seq"'::regclass);


--
-- Name: Queues id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Queues" ALTER COLUMN id SET DEFAULT nextval('public."Queues_id_seq"'::regclass);


--
-- Name: QuickMessages id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QuickMessages" ALTER COLUMN id SET DEFAULT nextval('public."QuickMessages_id_seq"'::regclass);


--
-- Name: ScheduledMessages id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ScheduledMessages" ALTER COLUMN id SET DEFAULT nextval('public."ScheduledMessages_id_seq"'::regclass);


--
-- Name: ScheduledMessagesEnvios id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ScheduledMessagesEnvios" ALTER COLUMN id SET DEFAULT nextval('public."ScheduledMessagesEnvios_id_seq"'::regclass);


--
-- Name: Schedules id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules" ALTER COLUMN id SET DEFAULT nextval('public."Schedules_id_seq"'::regclass);


--
-- Name: Settings id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Settings" ALTER COLUMN id SET DEFAULT nextval('public."Settings_id_seq"'::regclass);


--
-- Name: SliderBanners id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."SliderBanners" ALTER COLUMN id SET DEFAULT nextval('public."SliderBanners_id_seq"'::regclass);


--
-- Name: Subscriptions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Subscriptions" ALTER COLUMN id SET DEFAULT nextval('public."Subscriptions_id_seq"'::regclass);


--
-- Name: Tags id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tags" ALTER COLUMN id SET DEFAULT nextval('public."Tags_id_seq"'::regclass);


--
-- Name: TicketNotes id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketNotes" ALTER COLUMN id SET DEFAULT nextval('public."TicketNotes_id_seq"'::regclass);


--
-- Name: TicketTraking id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTraking" ALTER COLUMN id SET DEFAULT nextval('public."TicketTraking_id_seq"'::regclass);


--
-- Name: Tickets id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets" ALTER COLUMN id SET DEFAULT nextval('public."Tickets_id_seq"'::regclass);


--
-- Name: Translations id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Translations" ALTER COLUMN id SET DEFAULT nextval('public."Translations_id_seq"'::regclass);


--
-- Name: UserDevices id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserDevices" ALTER COLUMN id SET DEFAULT nextval('public."UserDevices_id_seq"'::regclass);


--
-- Name: UserGoogleCalendarIntegrations id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserGoogleCalendarIntegrations" ALTER COLUMN id SET DEFAULT nextval('public."UserGoogleCalendarIntegrations_id_seq"'::regclass);


--
-- Name: UserPagePermissions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserPagePermissions" ALTER COLUMN id SET DEFAULT nextval('public."UserPagePermissions_id_seq"'::regclass);


--
-- Name: UserRatings id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserRatings" ALTER COLUMN id SET DEFAULT nextval('public."UserRatings_id_seq"'::regclass);


--
-- Name: UserServices id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserServices" ALTER COLUMN id SET DEFAULT nextval('public."UserServices_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: Versions id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Versions" ALTER COLUMN id SET DEFAULT nextval('public."Versions_id_seq"'::regclass);


--
-- Name: Webhooks id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Webhooks" ALTER COLUMN id SET DEFAULT nextval('public."Webhooks_id_seq"'::regclass);


--
-- Name: Whatsapps id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps" ALTER COLUMN id SET DEFAULT nextval('public."Whatsapps_id_seq"'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: company_api_keys id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_api_keys ALTER COLUMN id SET DEFAULT nextval('public.company_api_keys_id_seq'::regclass);


--
-- Name: company_integration_field_maps id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_integration_field_maps ALTER COLUMN id SET DEFAULT nextval('public.company_integration_field_maps_id_seq'::regclass);


--
-- Name: company_integration_settings id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_integration_settings ALTER COLUMN id SET DEFAULT nextval('public.company_integration_settings_id_seq'::regclass);


--
-- Name: company_payment_settings id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_payment_settings ALTER COLUMN id SET DEFAULT nextval('public.company_payment_settings_id_seq'::regclass);


--
-- Name: crm_client_contacts id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_client_contacts ALTER COLUMN id SET DEFAULT nextval('public.crm_client_contacts_id_seq'::regclass);


--
-- Name: crm_clients id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_clients ALTER COLUMN id SET DEFAULT nextval('public.crm_clients_id_seq'::regclass);


--
-- Name: crm_leads id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_leads ALTER COLUMN id SET DEFAULT nextval('public.crm_leads_id_seq'::regclass);


--
-- Name: financeiro_faturas id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_faturas ALTER COLUMN id SET DEFAULT nextval('public.financeiro_faturas_id_seq'::regclass);


--
-- Name: financeiro_pagamentos id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_pagamentos ALTER COLUMN id SET DEFAULT nextval('public.financeiro_pagamentos_id_seq'::regclass);


--
-- Name: media_files id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.media_files ALTER COLUMN id SET DEFAULT nextval('public.media_files_id_seq'::regclass);


--
-- Name: media_folders id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.media_folders ALTER COLUMN id SET DEFAULT nextval('public.media_folders_id_seq'::regclass);


--
-- Name: profissionais id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.profissionais ALTER COLUMN id SET DEFAULT nextval('public.profissionais_id_seq'::regclass);


--
-- Name: project_products id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_products ALTER COLUMN id SET DEFAULT nextval('public.project_products_id_seq'::regclass);


--
-- Name: project_services id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_services ALTER COLUMN id SET DEFAULT nextval('public.project_services_id_seq'::regclass);


--
-- Name: project_task_users id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_task_users ALTER COLUMN id SET DEFAULT nextval('public.project_task_users_id_seq'::regclass);


--
-- Name: project_tasks id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_tasks ALTER COLUMN id SET DEFAULT nextval('public.project_tasks_id_seq'::regclass);


--
-- Name: project_users id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_users ALTER COLUMN id SET DEFAULT nextval('public.project_users_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: scheduled_dispatch_logs id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatch_logs ALTER COLUMN id SET DEFAULT nextval('public.scheduled_dispatch_logs_id_seq'::regclass);


--
-- Name: scheduled_dispatchers id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatchers ALTER COLUMN id SET DEFAULT nextval('public.scheduled_dispatchers_id_seq'::regclass);


--
-- Name: servicos id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.servicos ALTER COLUMN id SET DEFAULT nextval('public.servicos_id_seq'::regclass);


--
-- Name: slider_home id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.slider_home ALTER COLUMN id SET DEFAULT nextval('public.slider_home_id_seq'::regclass);


--
-- Name: tutorial_videos id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.tutorial_videos ALTER COLUMN id SET DEFAULT nextval('public.tutorial_videos_id_seq'::regclass);


--
-- Name: user_schedules id; Type: DEFAULT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.user_schedules ALTER COLUMN id SET DEFAULT nextval('public.user_schedules_id_seq'::regclass);


--
-- Data for Name: AffiliateCommissions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."AffiliateCommissions" (id, "affiliateId", "referredCompanyId", "invoiceId", "commissionAmount", "commissionRate", status, notes, metadata, "createdAt", "paidAt", "updatedAt", "faturaId") FROM stdin;
\.


--
-- Data for Name: AffiliateLinks; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."AffiliateLinks" (id, "affiliateId", code, url, clicks, signups, conversions, "trackingData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AffiliateWithdrawals; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."AffiliateWithdrawals" (id, "affiliateId", amount, status, "paymentMethod", "paymentDetails", notes, "rejectionReason", "createdAt", "processedAt", "processedBy", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Affiliates; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Affiliates" (id, "companyId", "affiliateCode", "commissionRate", "minWithdrawAmount", "totalEarned", "totalWithdrawn", status, "createdAt", "updatedAt") FROM stdin;
3	1	90E92D	10.00	50.00	0.00	0.00	active	2026-02-24 21:51:46.503	2026-02-24 21:51:46.503
\.


--
-- Data for Name: Announcements; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Announcements" (id, priority, title, text, "mediaPath", "mediaName", "companyId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ApiUsages; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ApiUsages" (id, "companyId", "dateUsed", "UsedOnDay", "usedText", "usedPDF", "usedImage", "usedVideo", "usedOther", "usedCheckNumber", "createdAt", "updatedAt") FROM stdin;
1	1	21/11/2025	1	0	1	0	0	0	0	2025-11-21 03:35:08.607+00	2025-11-21 03:35:08.613+00
2	1	02/12/2025	23	23	0	0	0	0	0	2025-12-02 19:22:44.499+00	2025-12-03 02:50:43.55+00
3	1	10/12/2025	1	1	0	0	0	0	0	2025-12-10 19:51:20.438+00	2025-12-10 19:51:20.443+00
\.


--
-- Data for Name: AutomationActions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."AutomationActions" (id, "automationId", "actionType", "actionConfig", "order", "delayMinutes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AutomationExecutions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."AutomationExecutions" (id, "automationId", "automationActionId", "contactId", "ticketId", "scheduledAt", status, attempts, "lastAttemptAt", "completedAt", error, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AutomationLogs; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."AutomationLogs" (id, "automationId", "contactId", "ticketId", status, "executedAt", result, error, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Automations; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Automations" (id, "companyId", name, description, "triggerType", "triggerConfig", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Baileys; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Baileys" (id, "whatsappId", contacts, chats, "createdAt", "updatedAt") FROM stdin;
9	32	[]	\N	2025-11-20 17:18:53.85+00	2025-11-20 17:18:53.85+00
10	51	[]	\N	2025-11-24 20:40:14.279+00	2025-11-24 20:40:14.279+00
28	53	[]	\N	2025-11-26 17:19:25.13+00	2025-11-26 17:19:25.13+00
29	53	[]	\N	2025-11-26 17:19:25.13+00	2025-11-26 17:19:25.13+00
30	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
31	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
32	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
33	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
34	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
35	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
36	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
38	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
39	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
40	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
41	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
42	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
43	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
44	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
45	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
46	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
47	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
48	53	[]	\N	2025-11-26 17:19:25.125+00	2025-11-26 17:19:25.125+00
49	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
37	53	[]	\N	2025-11-26 17:19:25.244+00	2025-11-26 17:19:25.244+00
50	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
51	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
52	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
53	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
54	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
55	53	[]	\N	2025-11-26 17:19:25.392+00	2025-11-26 17:19:25.392+00
56	53	[]	\N	2025-11-26 17:19:25.392+00	2025-11-26 17:19:25.392+00
57	53	[]	\N	2025-11-26 17:19:25.392+00	2025-11-26 17:19:25.392+00
58	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
59	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
60	53	[]	\N	2025-11-26 17:19:25.307+00	2025-11-26 17:19:25.307+00
61	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
62	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
63	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
64	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
65	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
66	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
67	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
68	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
69	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
70	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
71	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
72	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
73	53	[]	\N	2025-11-26 17:19:25.352+00	2025-11-26 17:19:25.352+00
74	53	[]	\N	2025-11-26 17:19:25.352+00	2025-11-26 17:19:25.352+00
75	53	[]	\N	2025-11-26 17:19:25.352+00	2025-11-26 17:19:25.352+00
76	53	[]	\N	2025-11-26 17:19:25.352+00	2025-11-26 17:19:25.352+00
77	53	[]	\N	2025-11-26 17:19:25.38+00	2025-11-26 17:19:25.38+00
78	53	[]	\N	2025-11-26 17:19:25.38+00	2025-11-26 17:19:25.38+00
79	53	[]	\N	2025-11-26 17:19:25.391+00	2025-11-26 17:19:25.391+00
80	53	[]	\N	2025-11-26 17:19:25.412+00	2025-11-26 17:19:25.412+00
81	53	[]	\N	2025-11-26 17:19:25.412+00	2025-11-26 17:19:25.412+00
82	53	[]	\N	2025-11-26 17:19:25.391+00	2025-11-26 17:19:25.391+00
83	53	[]	\N	2025-11-26 17:19:25.391+00	2025-11-26 17:19:25.391+00
84	53	[]	\N	2025-11-26 17:19:25.391+00	2025-11-26 17:19:25.391+00
85	53	[]	\N	2025-11-26 17:19:25.392+00	2025-11-26 17:19:25.392+00
86	53	[]	\N	2025-11-26 17:19:25.392+00	2025-11-26 17:19:25.392+00
87	53	[]	\N	2025-11-26 17:19:25.412+00	2025-11-26 17:19:25.412+00
88	53	[]	\N	2025-11-26 17:19:25.391+00	2025-11-26 17:19:25.391+00
89	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
90	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
91	53	[]	\N	2025-11-26 17:19:25.288+00	2025-11-26 17:19:25.288+00
93	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
94	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
96	53	[]	\N	2025-11-26 17:19:25.412+00	2025-11-26 17:19:25.412+00
97	53	[]	\N	2025-11-26 17:19:25.418+00	2025-11-26 17:19:25.418+00
98	53	[]	\N	2025-11-26 17:19:25.42+00	2025-11-26 17:19:25.42+00
99	53	[]	\N	2025-11-26 17:19:25.42+00	2025-11-26 17:19:25.42+00
100	53	[]	\N	2025-11-26 17:19:25.421+00	2025-11-26 17:19:25.421+00
101	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
102	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
103	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
105	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
106	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
107	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
108	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
109	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
110	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
111	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
112	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
113	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
114	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
115	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
116	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
117	53	[]	\N	2025-11-26 17:19:25.436+00	2025-11-26 17:19:25.436+00
118	53	[]	\N	2025-11-26 17:19:25.436+00	2025-11-26 17:19:25.436+00
119	53	[]	\N	2025-11-26 17:19:25.436+00	2025-11-26 17:19:25.436+00
132	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
143	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
153	53	[]	\N	2025-11-26 17:19:25.471+00	2025-11-26 17:19:25.471+00
170	53	[]	\N	2025-11-26 17:19:25.502+00	2025-11-26 17:19:25.502+00
186	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
203	53	[]	\N	2025-11-26 17:19:25.517+00	2025-11-26 17:19:25.517+00
209	53	[]	\N	2025-11-26 17:19:25.533+00	2025-11-26 17:19:25.533+00
215	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
239	53	[]	\N	2025-11-26 17:19:25.55+00	2025-11-26 17:19:25.55+00
246	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
249	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
284	53	[]	\N	2025-11-26 17:19:25.564+00	2025-11-26 17:19:25.564+00
295	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
310	53	[]	\N	2025-11-26 17:19:25.588+00	2025-11-26 17:19:25.588+00
315	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
316	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
348	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
364	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
393	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
400	53	[]	\N	2025-11-26 17:19:25.659+00	2025-11-26 17:19:25.659+00
412	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
414	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
450	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
453	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
460	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
485	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
491	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
531	53	[]	\N	2025-11-26 17:19:25.834+00	2025-11-26 17:19:25.834+00
534	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
573	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
582	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
597	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
126	53	[]	\N	2025-11-26 17:19:25.392+00	2025-11-26 17:19:25.392+00
2150	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2245	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2347	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2439	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
133	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
144	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
154	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
171	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
187	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
208	53	[]	\N	2025-11-26 17:19:25.517+00	2025-11-26 17:19:25.517+00
219	53	[]	\N	2025-11-26 17:19:25.533+00	2025-11-26 17:19:25.533+00
222	53	[]	\N	2025-11-26 17:19:25.529+00	2025-11-26 17:19:25.529+00
234	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
242	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
254	53	[]	\N	2025-11-26 17:19:25.555+00	2025-11-26 17:19:25.555+00
276	53	[]	\N	2025-11-26 17:19:25.564+00	2025-11-26 17:19:25.564+00
294	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
325	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
327	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
363	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
381	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
382	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
407	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
428	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
433	53	[]	\N	2025-11-26 17:19:25.659+00	2025-11-26 17:19:25.659+00
435	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
488	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
499	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
511	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
532	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
558	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
562	53	[]	\N	2025-11-26 17:19:25.872+00	2025-11-26 17:19:25.872+00
569	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
599	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
123	53	[]	\N	2025-11-26 17:19:25.441+00	2025-11-26 17:19:25.441+00
1633	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1667	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1745	83	[]	\N	2026-01-13 21:09:21.412+00	2026-01-13 21:09:21.412+00
1836	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1933	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2041	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2141	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2254	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2339	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2440	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
134	53	[]	\N	2025-11-26 17:19:25.461+00	2025-11-26 17:19:25.461+00
145	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
155	53	[]	\N	2025-11-26 17:19:25.479+00	2025-11-26 17:19:25.479+00
172	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
188	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
199	53	[]	\N	2025-11-26 17:19:25.517+00	2025-11-26 17:19:25.517+00
211	53	[]	\N	2025-11-26 17:19:25.533+00	2025-11-26 17:19:25.533+00
217	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
240	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
241	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
250	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
275	53	[]	\N	2025-11-26 17:19:25.563+00	2025-11-26 17:19:25.563+00
293	53	[]	\N	2025-11-26 17:19:25.575+00	2025-11-26 17:19:25.575+00
314	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
318	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
319	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
331	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
362	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
385	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
394	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
402	53	[]	\N	2025-11-26 17:19:25.659+00	2025-11-26 17:19:25.659+00
427	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
432	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
454	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
470	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
473	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
501	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
505	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
544	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
552	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
559	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
567	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
581	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
125	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
1592	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1661	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1735	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1830	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1911	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2033	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2133	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2220	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2279	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2384	83	[]	\N	2026-01-13 21:09:21.98+00	2026-01-13 21:09:21.98+00
2475	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
135	53	[]	\N	2025-11-26 17:19:25.466+00	2025-11-26 17:19:25.466+00
147	53	[]	\N	2025-11-26 17:19:25.461+00	2025-11-26 17:19:25.461+00
156	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
173	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
189	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
202	53	[]	\N	2025-11-26 17:19:25.517+00	2025-11-26 17:19:25.517+00
210	53	[]	\N	2025-11-26 17:19:25.533+00	2025-11-26 17:19:25.533+00
221	53	[]	\N	2025-11-26 17:19:25.529+00	2025-11-26 17:19:25.529+00
235	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
238	53	[]	\N	2025-11-26 17:19:25.546+00	2025-11-26 17:19:25.546+00
247	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
274	53	[]	\N	2025-11-26 17:19:25.562+00	2025-11-26 17:19:25.562+00
290	53	[]	\N	2025-11-26 17:19:25.575+00	2025-11-26 17:19:25.575+00
309	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
317	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
330	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
359	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
378	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
384	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
388	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
401	53	[]	\N	2025-11-26 17:19:25.659+00	2025-11-26 17:19:25.659+00
445	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
462	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
471	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
484	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
496	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
509	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
510	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
541	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
548	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
556	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
561	53	[]	\N	2025-11-26 17:19:25.872+00	2025-11-26 17:19:25.872+00
578	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
122	53	[]	\N	2025-11-26 17:19:25.441+00	2025-11-26 17:19:25.441+00
1610	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1681	83	[]	\N	2026-01-13 21:09:21.279+00	2026-01-13 21:09:21.279+00
1817	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1922	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2022	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2120	83	[]	\N	2026-01-13 21:09:21.76+00	2026-01-13 21:09:21.76+00
2223	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2320	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2382	83	[]	\N	2026-01-13 21:09:21.98+00	2026-01-13 21:09:21.98+00
2474	83	[]	\N	2026-01-13 21:09:22.144+00	2026-01-13 21:09:22.144+00
136	53	[]	\N	2025-11-26 17:19:25.466+00	2025-11-26 17:19:25.466+00
146	53	[]	\N	2025-11-26 17:19:25.471+00	2025-11-26 17:19:25.471+00
157	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
174	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
190	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
200	53	[]	\N	2025-11-26 17:19:25.517+00	2025-11-26 17:19:25.517+00
213	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
225	53	[]	\N	2025-11-26 17:19:25.533+00	2025-11-26 17:19:25.533+00
243	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
252	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
255	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
273	53	[]	\N	2025-11-26 17:19:25.562+00	2025-11-26 17:19:25.562+00
291	53	[]	\N	2025-11-26 17:19:25.575+00	2025-11-26 17:19:25.575+00
312	53	[]	\N	2025-11-26 17:19:25.592+00	2025-11-26 17:19:25.592+00
323	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
324	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
326	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
360	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
431	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
440	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
447	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
449	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
452	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
506	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
515	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
520	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
542	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
555	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
563	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
589	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
592	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
121	53	[]	\N	2025-11-26 17:19:25.441+00	2025-11-26 17:19:25.441+00
1559	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1598	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1695	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1776	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1849	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1941	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2061	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2136	83	[]	\N	2026-01-13 21:09:21.769+00	2026-01-13 21:09:21.769+00
2230	83	[]	\N	2026-01-13 21:09:21.882+00	2026-01-13 21:09:21.882+00
2361	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2463	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
137	53	[]	\N	2025-11-26 17:19:25.466+00	2025-11-26 17:19:25.466+00
148	53	[]	\N	2025-11-26 17:19:25.471+00	2025-11-26 17:19:25.471+00
158	53	[]	\N	2025-11-26 17:19:25.479+00	2025-11-26 17:19:25.479+00
175	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
191	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
201	53	[]	\N	2025-11-26 17:19:25.517+00	2025-11-26 17:19:25.517+00
207	53	[]	\N	2025-11-26 17:19:25.529+00	2025-11-26 17:19:25.529+00
212	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
232	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
244	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
253	53	[]	\N	2025-11-26 17:19:25.555+00	2025-11-26 17:19:25.555+00
260	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
272	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
289	53	[]	\N	2025-11-26 17:19:25.573+00	2025-11-26 17:19:25.573+00
311	53	[]	\N	2025-11-26 17:19:25.588+00	2025-11-26 17:19:25.588+00
313	53	[]	\N	2025-11-26 17:19:25.592+00	2025-11-26 17:19:25.592+00
332	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
343	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
358	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
387	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
429	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
430	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
436	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
459	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
464	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
500	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
503	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
508	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
551	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
557	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
560	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
579	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
583	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
130	53	[]	\N	2025-11-26 17:19:25.352+00	2025-11-26 17:19:25.352+00
1616	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1676	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1819	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1914	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2026	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2122	83	[]	\N	2026-01-13 21:09:21.76+00	2026-01-13 21:09:21.76+00
2225	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2322	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2428	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
139	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
149	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
160	53	[]	\N	2025-11-26 17:19:25.479+00	2025-11-26 17:19:25.479+00
176	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
192	53	[]	\N	2025-11-26 17:19:25.516+00	2025-11-26 17:19:25.516+00
204	53	[]	\N	2025-11-26 17:19:25.521+00	2025-11-26 17:19:25.521+00
220	53	[]	\N	2025-11-26 17:19:25.529+00	2025-11-26 17:19:25.529+00
237	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
245	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
271	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
283	53	[]	\N	2025-11-26 17:19:25.573+00	2025-11-26 17:19:25.573+00
305	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
322	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
333	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
344	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
374	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
380	53	[]	\N	2025-11-26 17:19:25.588+00	2025-11-26 17:19:25.588+00
391	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
404	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
437	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
446	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
448	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
458	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
474	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
507	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
512	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
518	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
545	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
554	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
572	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
585	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
603	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
131	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
1617	83	[]	\N	2026-01-13 21:09:21.139+00	2026-01-13 21:09:21.139+00
1704	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1770	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1846	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1949	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2047	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2151	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2248	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2355	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2453	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
140	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
150	53	[]	\N	2025-11-26 17:19:25.479+00	2025-11-26 17:19:25.479+00
161	53	[]	\N	2025-11-26 17:19:25.479+00	2025-11-26 17:19:25.479+00
177	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
193	53	[]	\N	2025-11-26 17:19:25.516+00	2025-11-26 17:19:25.516+00
205	53	[]	\N	2025-11-26 17:19:25.517+00	2025-11-26 17:19:25.517+00
214	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
258	53	[]	\N	2025-11-26 17:19:25.557+00	2025-11-26 17:19:25.557+00
259	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
270	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
292	53	[]	\N	2025-11-26 17:19:25.575+00	2025-11-26 17:19:25.575+00
304	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
336	53	[]	\N	2025-11-26 17:19:25.607+00	2025-11-26 17:19:25.607+00
345	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
347	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
361	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
373	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
392	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
397	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
410	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
420	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
421	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
457	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
472	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
476	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
478	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
487	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
521	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
522	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
525	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
543	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
571	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
587	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
588	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
590	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
127	53	[]	\N	2025-11-26 17:19:25.336+00	2025-11-26 17:19:25.336+00
1619	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1682	83	[]	\N	2026-01-13 21:09:21.279+00	2026-01-13 21:09:21.279+00
1765	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1853	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1947	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2055	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2155	83	[]	\N	2026-01-13 21:09:21.771+00	2026-01-13 21:09:21.771+00
2244	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2348	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2450	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
141	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
151	53	[]	\N	2025-11-26 17:19:25.466+00	2025-11-26 17:19:25.466+00
162	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
178	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
194	53	[]	\N	2025-11-26 17:19:25.516+00	2025-11-26 17:19:25.516+00
206	53	[]	\N	2025-11-26 17:19:25.525+00	2025-11-26 17:19:25.525+00
224	53	[]	\N	2025-11-26 17:19:25.533+00	2025-11-26 17:19:25.533+00
251	53	[]	\N	2025-11-26 17:19:25.557+00	2025-11-26 17:19:25.557+00
257	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
269	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
282	53	[]	\N	2025-11-26 17:19:25.568+00	2025-11-26 17:19:25.568+00
303	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
321	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
337	53	[]	\N	2025-11-26 17:19:25.622+00	2025-11-26 17:19:25.622+00
346	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
352	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
372	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
386	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
403	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
419	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
423	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
424	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
463	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
468	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
483	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
524	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
540	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
564	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
565	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
577	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
594	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
128	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
1638	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1719	83	[]	\N	2026-01-13 21:09:21.337+00	2026-01-13 21:09:21.337+00
1761	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1840	83	[]	\N	2026-01-13 21:09:21.496+00	2026-01-13 21:09:21.496+00
1951	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2064	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2161	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2241	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2349	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2452	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
138	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
142	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
152	53	[]	\N	2025-11-26 17:19:25.47+00	2025-11-26 17:19:25.47+00
163	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
179	53	[]	\N	2025-11-26 17:19:25.504+00	2025-11-26 17:19:25.504+00
195	53	[]	\N	2025-11-26 17:19:25.516+00	2025-11-26 17:19:25.516+00
216	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
223	53	[]	\N	2025-11-26 17:19:25.529+00	2025-11-26 17:19:25.529+00
228	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
233	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
248	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
262	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
264	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
268	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
281	53	[]	\N	2025-11-26 17:19:25.568+00	2025-11-26 17:19:25.568+00
302	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
320	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
335	53	[]	\N	2025-11-26 17:19:25.606+00	2025-11-26 17:19:25.606+00
339	53	[]	\N	2025-11-26 17:19:25.627+00	2025-11-26 17:19:25.627+00
349	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
355	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
371	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
390	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
405	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
406	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
413	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
438	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
442	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
461	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
475	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
490	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
493	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
504	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
517	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
529	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
530	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
553	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
574	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
576	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
591	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
598	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
92	53	[]	\N	2025-11-26 17:19:25.287+00	2025-11-26 17:19:25.287+00
1565	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1588	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1679	83	[]	\N	2026-01-13 21:09:21.209+00	2026-01-13 21:09:21.209+00
1820	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1910	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2014	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2096	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2176	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2269	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2368	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2465	83	[]	\N	2026-01-13 21:09:22.102+00	2026-01-13 21:09:22.102+00
164	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
180	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
196	53	[]	\N	2025-11-26 17:19:25.516+00	2025-11-26 17:19:25.516+00
267	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
286	53	[]	\N	2025-11-26 17:19:25.567+00	2025-11-26 17:19:25.567+00
301	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
329	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
340	53	[]	\N	2025-11-26 17:19:25.627+00	2025-11-26 17:19:25.627+00
370	53	[]	\N	2025-11-26 17:19:25.645+00	2025-11-26 17:19:25.645+00
389	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
409	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
425	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
466	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
480	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
498	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
536	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
537	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
549	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
602	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
104	53	[]	\N	2025-11-26 17:19:25.425+00	2025-11-26 17:19:25.425+00
1601	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1677	83	[]	\N	2026-01-13 21:09:21.209+00	2026-01-13 21:09:21.209+00
1801	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1888	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1999	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2075	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2169	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2314	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2406	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
165	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
181	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
197	53	[]	\N	2025-11-26 17:19:25.516+00	2025-11-26 17:19:25.516+00
266	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
280	53	[]	\N	2025-11-26 17:19:25.566+00	2025-11-26 17:19:25.566+00
300	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
334	53	[]	\N	2025-11-26 17:19:25.606+00	2025-11-26 17:19:25.606+00
341	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
369	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
395	53	[]	\N	2025-11-26 17:19:25.659+00	2025-11-26 17:19:25.659+00
422	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
443	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
455	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
489	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
514	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
533	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
568	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
600	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
124	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
1570	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1620	83	[]	\N	2026-01-13 21:09:21.139+00	2026-01-13 21:09:21.139+00
1668	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1795	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1876	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1995	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2084	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2197	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2297	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2418	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
166	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
182	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
198	53	[]	\N	2025-11-26 17:19:25.516+00	2025-11-26 17:19:25.516+00
265	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
279	53	[]	\N	2025-11-26 17:19:25.566+00	2025-11-26 17:19:25.566+00
299	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
338	53	[]	\N	2025-11-26 17:19:25.627+00	2025-11-26 17:19:25.627+00
351	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
368	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
434	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
441	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
502	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
516	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
550	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
584	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
95	53	[]	\N	2025-11-26 17:19:25.412+00	2025-11-26 17:19:25.412+00
606	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
1543	30	[]	\N	2025-12-31 16:40:15.748+00	2025-12-31 16:40:15.748+00
1569	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1585	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1724	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1803	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1885	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1971	83	[]	\N	2026-01-13 21:09:21.587+00	2026-01-13 21:09:21.587+00
2108	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2196	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2289	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2387	83	[]	\N	2026-01-13 21:09:22.007+00	2026-01-13 21:09:22.007+00
2483	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
159	53	[]	\N	2025-11-26 17:19:25.442+00	2025-11-26 17:19:25.442+00
167	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
183	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
218	53	[]	\N	2025-11-26 17:19:25.523+00	2025-11-26 17:19:25.523+00
256	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
285	53	[]	\N	2025-11-26 17:19:25.566+00	2025-11-26 17:19:25.566+00
298	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
306	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
328	53	[]	\N	2025-11-26 17:19:25.593+00	2025-11-26 17:19:25.593+00
353	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
367	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
376	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
396	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
399	53	[]	\N	2025-11-26 17:19:25.659+00	2025-11-26 17:19:25.659+00
408	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
444	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
456	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
469	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
494	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
538	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
546	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
570	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
575	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
129	53	[]	\N	2025-11-26 17:19:25.435+00	2025-11-26 17:19:25.435+00
1544	30	[]	\N	2025-12-31 16:40:15.748+00	2025-12-31 16:40:15.748+00
1564	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1589	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1669	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1796	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1877	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1996	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2068	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2184	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2277	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2377	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2479	83	[]	\N	2026-01-13 21:09:22.144+00	2026-01-13 21:09:22.144+00
168	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
184	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
227	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
236	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
278	53	[]	\N	2025-11-26 17:19:25.564+00	2025-11-26 17:19:25.564+00
297	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
342	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
366	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
379	53	[]	\N	2025-11-26 17:19:25.588+00	2025-11-26 17:19:25.588+00
416	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
418	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
439	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
482	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
486	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
513	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
526	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
527	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
593	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
595	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
604	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
807	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
902	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1014	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1164	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1296	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1469	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1545	30	[]	\N	2025-12-31 16:40:15.748+00	2025-12-31 16:40:15.748+00
1561	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1625	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1670	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1791	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1875	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1992	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2077	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2183	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2300	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2404	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
169	53	[]	\N	2025-11-26 17:19:25.494+00	2025-11-26 17:19:25.494+00
185	53	[]	\N	2025-11-26 17:19:25.51+00	2025-11-26 17:19:25.51+00
277	53	[]	\N	2025-11-26 17:19:25.564+00	2025-11-26 17:19:25.564+00
296	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
350	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
365	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
398	53	[]	\N	2025-11-26 17:19:25.658+00	2025-11-26 17:19:25.658+00
417	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
467	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
479	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
535	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
539	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
612	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
714	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
813	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
913	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1012	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1162	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1284	60	[]	\N	2025-12-08 23:22:49.661+00	2025-12-08 23:22:49.661+00
1467	60	[]	\N	2025-12-08 23:22:49.705+00	2025-12-08 23:22:49.705+00
1546	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1566	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1626	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1672	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1790	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1902	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1997	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2099	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2205	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2312	83	[]	\N	2026-01-13 21:09:21.953+00	2026-01-13 21:09:21.953+00
2417	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
614	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
711	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
814	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
914	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1013	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1163	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1285	60	[]	\N	2025-12-08 23:22:49.661+00	2025-12-08 23:22:49.661+00
1468	60	[]	\N	2025-12-08 23:22:49.705+00	2025-12-08 23:22:49.705+00
1547	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1562	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1621	83	[]	\N	2026-01-13 21:09:21.139+00	2026-01-13 21:09:21.139+00
1692	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1766	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1856	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1955	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2049	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2154	83	[]	\N	2026-01-13 21:09:21.771+00	2026-01-13 21:09:21.771+00
2237	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2343	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2446	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
613	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
712	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
811	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
910	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1009	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1112	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1282	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1464	60	[]	\N	2025-12-08 23:22:49.705+00	2025-12-08 23:22:49.705+00
1548	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1622	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1700	83	[]	\N	2026-01-13 21:09:21.305+00	2026-01-13 21:09:21.305+00
1789	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1880	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1991	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2079	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2206	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2311	83	[]	\N	2026-01-13 21:09:21.953+00	2026-01-13 21:09:21.953+00
2424	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
611	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
713	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
812	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
912	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1011	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1117	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1283	60	[]	\N	2025-12-08 23:22:49.661+00	2025-12-08 23:22:49.661+00
1466	60	[]	\N	2025-12-08 23:22:49.705+00	2025-12-08 23:22:49.705+00
1549	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1568	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1599	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1673	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1811	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1898	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
1994	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2070	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2168	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2270	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2369	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2467	83	[]	\N	2026-01-13 21:09:22.102+00	2026-01-13 21:09:22.102+00
226	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
261	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
354	53	[]	\N	2025-11-26 17:19:25.628+00	2025-11-26 17:19:25.628+00
411	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
477	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
523	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
596	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
615	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
715	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
821	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
922	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1047	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1150	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1267	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1361	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1516	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1550	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1611	83	[]	\N	2026-01-13 21:09:21.177+00	2026-01-13 21:09:21.177+00
1701	83	[]	\N	2026-01-13 21:09:21.305+00	2026-01-13 21:09:21.305+00
1771	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1844	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1945	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2045	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2143	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2232	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2357	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2461	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
616	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
716	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
815	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
915	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1015	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1113	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1281	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1463	60	[]	\N	2025-12-08 23:22:49.705+00	2025-12-08 23:22:49.705+00
1551	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1594	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1685	83	[]	\N	2026-01-13 21:09:21.279+00	2026-01-13 21:09:21.279+00
1807	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1889	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1993	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2069	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2172	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2280	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2399	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
617	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
718	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
819	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
920	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1025	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1141	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1254	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1351	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1432	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1526	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1552	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1563	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1586	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1683	83	[]	\N	2026-01-13 21:09:21.279+00	2026-01-13 21:09:21.279+00
1799	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1891	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1969	83	[]	\N	2026-01-13 21:09:21.587+00	2026-01-13 21:09:21.587+00
2102	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2204	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2292	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2381	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2488	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
618	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
721	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
820	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
923	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1054	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1152	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1265	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1362	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1507	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1553	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1606	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1689	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1794	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1886	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1970	83	[]	\N	2026-01-13 21:09:21.587+00	2026-01-13 21:09:21.587+00
2095	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2175	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2275	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2411	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
229	53	[]	\N	2025-11-26 17:19:25.539+00	2025-11-26 17:19:25.539+00
230	53	[]	\N	2025-11-26 17:19:25.541+00	2025-11-26 17:19:25.541+00
263	53	[]	\N	2025-11-26 17:19:25.542+00	2025-11-26 17:19:25.542+00
307	53	[]	\N	2025-11-26 17:19:25.576+00	2025-11-26 17:19:25.576+00
356	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
375	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
415	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
426	53	[]	\N	2025-11-26 17:19:25.684+00	2025-11-26 17:19:25.684+00
481	53	[]	\N	2025-11-26 17:19:25.733+00	2025-11-26 17:19:25.733+00
519	53	[]	\N	2025-11-26 17:19:25.739+00	2025-11-26 17:19:25.739+00
528	53	[]	\N	2025-11-26 17:19:25.74+00	2025-11-26 17:19:25.74+00
586	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
601	53	[]	\N	2025-11-26 17:19:25.875+00	2025-11-26 17:19:25.875+00
619	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
719	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
816	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
916	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1016	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1110	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1213	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1305	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1378	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1436	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1554	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1624	83	[]	\N	2026-01-13 21:09:21.139+00	2026-01-13 21:09:21.139+00
1671	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1786	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1873	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1967	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2067	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2167	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2324	83	[]	\N	2026-01-13 21:09:21.976+00	2026-01-13 21:09:21.976+00
2430	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
620	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
720	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
817	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
917	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1017	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1111	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1277	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1450	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1555	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1567	30	[]	\N	2025-12-31 16:40:15.777+00	2025-12-31 16:40:15.777+00
1604	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1687	83	[]	\N	2026-01-13 21:09:21.279+00	2026-01-13 21:09:21.279+00
1805	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1887	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1968	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2110	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2209	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2282	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2376	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2477	83	[]	\N	2026-01-13 21:09:22.106+00	2026-01-13 21:09:22.106+00
621	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
717	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
818	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
918	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1020	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1127	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1236	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1346	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1424	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1556	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1603	83	[]	\N	2026-01-13 21:09:21.139+00	2026-01-13 21:09:21.139+00
1703	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1777	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1855	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1939	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2027	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2113	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2214	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2301	83	[]	\N	2026-01-13 21:09:21.904+00	2026-01-13 21:09:21.904+00
2394	83	[]	\N	2026-01-13 21:09:22.051+00	2026-01-13 21:09:22.051+00
2489	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
622	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
723	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
823	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
924	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1055	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1153	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1269	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1371	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1512	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1557	30	[]	\N	2025-12-31 16:40:15.749+00	2025-12-31 16:40:15.749+00
1593	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1675	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1792	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1879	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1985	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2091	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2203	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2296	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2386	83	[]	\N	2026-01-13 21:09:21.98+00	2026-01-13 21:09:21.98+00
2485	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
287	53	[]	\N	2025-11-26 17:19:25.541+00	2025-11-26 17:19:25.541+00
288	53	[]	\N	2025-11-26 17:19:25.541+00	2025-11-26 17:19:25.541+00
231	53	[]	\N	2025-11-26 17:19:25.534+00	2025-11-26 17:19:25.534+00
308	53	[]	\N	2025-11-26 17:19:25.558+00	2025-11-26 17:19:25.558+00
357	53	[]	\N	2025-11-26 17:19:25.629+00	2025-11-26 17:19:25.629+00
377	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
383	53	[]	\N	2025-11-26 17:19:25.646+00	2025-11-26 17:19:25.646+00
451	53	[]	\N	2025-11-26 17:19:25.685+00	2025-11-26 17:19:25.685+00
465	53	[]	\N	2025-11-26 17:19:25.712+00	2025-11-26 17:19:25.712+00
492	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
495	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
547	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
566	53	[]	\N	2025-11-26 17:19:25.873+00	2025-11-26 17:19:25.873+00
580	53	[]	\N	2025-11-26 17:19:25.874+00	2025-11-26 17:19:25.874+00
623	60	[]	\N	2025-12-08 23:22:49.202+00	2025-12-08 23:22:49.202+00
722	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
822	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
919	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1019	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1114	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1209	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1302	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1373	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1419	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1517	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1630	83	[]	\N	2026-01-13 21:09:21.18+00	2026-01-13 21:09:21.18+00
1693	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1797	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1882	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1981	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2107	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2188	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2285	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2380	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2481	83	[]	\N	2026-01-13 21:09:22.144+00	2026-01-13 21:09:22.144+00
624	60	[]	\N	2025-12-08 23:22:49.212+00	2025-12-08 23:22:49.212+00
724	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
824	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
921	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1018	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1116	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1272	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1440	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1600	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1674	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1802	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1884	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1988	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2088	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2191	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2288	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2408	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
625	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
725	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
825	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
925	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1021	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1115	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1211	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1304	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1376	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1416	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1503	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1613	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1705	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1768	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1848	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1944	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2048	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2146	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2251	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2336	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2412	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
626	60	[]	\N	2025-12-08 23:22:49.217+00	2025-12-08 23:22:49.217+00
726	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
827	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
928	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1022	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1159	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1274	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1444	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1587	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1698	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1813	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1896	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1984	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2105	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2186	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2318	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2413	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
627	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
727	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
826	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
926	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1026	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1149	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1262	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1368	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1509	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1575	72	[]	\N	2026-01-02 21:24:15.454+00	2026-01-02 21:24:15.454+00
1618	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1680	83	[]	\N	2026-01-13 21:09:21.279+00	2026-01-13 21:09:21.279+00
1763	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1841	83	[]	\N	2026-01-13 21:09:21.496+00	2026-01-13 21:09:21.496+00
1953	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2063	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2159	83	[]	\N	2026-01-13 21:09:21.822+00	2026-01-13 21:09:21.822+00
2243	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2330	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2426	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
628	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
728	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
828	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
927	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1023	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1126	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1226	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1340	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1410	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1498	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1596	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1688	83	[]	\N	2026-01-13 21:09:21.279+00	2026-01-13 21:09:21.279+00
1821	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1918	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2039	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2157	83	[]	\N	2026-01-13 21:09:21.801+00	2026-01-13 21:09:21.801+00
2236	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2335	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2436	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
629	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
729	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
829	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
929	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1024	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1142	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1252	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1349	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1430	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1525	60	[]	\N	2025-12-08 23:22:49.799+00	2025-12-08 23:22:49.799+00
1597	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1690	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1793	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1878	83	[]	\N	2026-01-13 21:09:21.533+00	2026-01-13 21:09:21.533+00
1987	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2104	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2187	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2284	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2375	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2480	83	[]	\N	2026-01-13 21:09:22.144+00	2026-01-13 21:09:22.144+00
630	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
730	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
830	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
930	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1034	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1134	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1227	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1339	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1411	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1499	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1609	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1678	83	[]	\N	2026-01-13 21:09:21.209+00	2026-01-13 21:09:21.209+00
1788	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1874	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1986	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2073	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2171	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2268	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2366	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2456	83	[]	\N	2026-01-13 21:09:22.102+00	2026-01-13 21:09:22.102+00
631	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
731	60	[]	\N	2025-12-08 23:22:49.32+00	2025-12-08 23:22:49.32+00
832	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
932	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1027	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1119	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1210	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1301	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1374	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1415	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1501	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1623	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1699	83	[]	\N	2026-01-13 21:09:21.298+00	2026-01-13 21:09:21.298+00
1775	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1851	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1943	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2054	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2149	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2249	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2334	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2414	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
632	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
737	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
837	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
934	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1041	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1143	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1255	60	[]	\N	2025-12-08 23:22:49.658+00	2025-12-08 23:22:49.658+00
1353	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1434	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1527	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1605	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1712	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1787	83	[]	\N	2026-01-13 21:09:21.449+00	2026-01-13 21:09:21.449+00
1881	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1983	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2093	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2180	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2305	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2397	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
633	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
733	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
833	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
933	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1030	60	[]	\N	2025-12-08 23:22:49.539+00	2025-12-08 23:22:49.539+00
1122	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1216	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1348	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1427	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1636	83	[]	\N	2026-01-13 21:09:21.177+00	2026-01-13 21:09:21.177+00
1702	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1809	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1899	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
1977	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2106	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2193	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2281	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2396	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
634	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
735	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
835	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
936	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1031	60	[]	\N	2025-12-08 23:22:49.539+00	2025-12-08 23:22:49.539+00
1123	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1223	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1335	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1407	60	[]	\N	2025-12-08 23:22:49.756+00	2025-12-08 23:22:49.756+00
1495	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1582	81	[]	\N	2026-01-12 21:59:00.959+00	2026-01-12 21:59:00.959+00
1615	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1691	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1806	83	[]	\N	2026-01-13 21:09:21.459+00	2026-01-13 21:09:21.459+00
1890	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1972	83	[]	\N	2026-01-13 21:09:21.587+00	2026-01-13 21:09:21.587+00
2090	83	[]	\N	2026-01-13 21:09:21.668+00	2026-01-13 21:09:21.668+00
2199	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2313	83	[]	\N	2026-01-13 21:09:21.976+00	2026-01-13 21:09:21.976+00
2403	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
635	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
732	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
831	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
931	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1029	60	[]	\N	2025-12-08 23:22:49.539+00	2025-12-08 23:22:49.539+00
1118	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1214	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1442	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1635	83	[]	\N	2026-01-13 21:09:21.177+00	2026-01-13 21:09:21.177+00
1721	83	[]	\N	2026-01-13 21:09:21.337+00	2026-01-13 21:09:21.337+00
1769	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1845	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1950	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2052	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2153	83	[]	\N	2026-01-13 21:09:21.771+00	2026-01-13 21:09:21.771+00
2258	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2362	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2464	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
636	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
734	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
834	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
935	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1028	60	[]	\N	2025-12-08 23:22:49.539+00	2025-12-08 23:22:49.539+00
1120	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1212	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1303	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1375	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1414	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1504	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1595	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1696	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1798	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1893	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1974	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2080	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2179	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2274	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2402	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
637	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
736	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
836	60	[]	\N	2025-12-08 23:22:49.426+00	2025-12-08 23:22:49.426+00
938	60	[]	\N	2025-12-08 23:22:49.488+00	2025-12-08 23:22:49.488+00
1033	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1128	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1220	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1333	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1405	60	[]	\N	2025-12-08 23:22:49.73+00	2025-12-08 23:22:49.73+00
1492	60	[]	\N	2025-12-08 23:22:49.797+00	2025-12-08 23:22:49.797+00
1590	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1697	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1812	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1895	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1980	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2097	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2208	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2299	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2405	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
638	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
738	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
839	60	[]	\N	2025-12-08 23:22:49.427+00	2025-12-08 23:22:49.427+00
939	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1035	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1147	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1260	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1358	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1460	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1602	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1694	83	[]	\N	2026-01-13 21:09:21.297+00	2026-01-13 21:09:21.297+00
1814	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1900	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
1975	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2078	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2194	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2317	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2454	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
639	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
741	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
841	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
941	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1037	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1124	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1218	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1329	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1401	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1486	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1591	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1713	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1774	83	[]	\N	2026-01-13 21:09:21.436+00	2026-01-13 21:09:21.436+00
1857	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1956	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2043	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2144	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2253	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2342	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2437	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
640	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
740	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
848	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
952	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1049	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1137	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1224	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1336	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1406	60	[]	\N	2025-12-08 23:22:49.73+00	2025-12-08 23:22:49.73+00
1493	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1628	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1708	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1767	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1852	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1966	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2056	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2164	83	[]	\N	2026-01-13 21:09:21.771+00	2026-01-13 21:09:21.771+00
2259	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2363	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2466	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
641	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
739	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
838	60	[]	\N	2025-12-08 23:22:49.427+00	2025-12-08 23:22:49.427+00
937	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1036	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1133	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1229	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1341	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1412	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1497	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1584	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1710	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1815	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1901	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
1973	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2074	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2177	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2276	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2388	83	[]	\N	2026-01-13 21:09:22.007+00	2026-01-13 21:09:22.007+00
2486	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
642	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
745	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
843	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
944	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1042	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1130	60	[]	\N	2025-12-08 23:22:49.605+00	2025-12-08 23:22:49.605+00
1217	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1331	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1403	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1489	60	[]	\N	2025-12-08 23:22:49.797+00	2025-12-08 23:22:49.797+00
1629	83	[]	\N	2026-01-13 21:09:21.139+00	2026-01-13 21:09:21.139+00
1714	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1779	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1854	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1965	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2053	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2148	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2257	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2344	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2444	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
643	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
755	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
855	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
953	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1052	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1148	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1261	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1359	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1461	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1612	83	[]	\N	2026-01-13 21:09:21.139+00	2026-01-13 21:09:21.139+00
1686	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1816	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1903	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2001	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2115	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2215	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2309	83	[]	\N	2026-01-13 21:09:21.953+00	2026-01-13 21:09:21.953+00
2400	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
497	53	[]	\N	2025-11-26 17:19:25.734+00	2025-11-26 17:19:25.734+00
644	60	[]	\N	2025-12-08 23:22:49.218+00	2025-12-08 23:22:49.218+00
749	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
844	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
942	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1038	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1121	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1215	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1314	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1447	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1627	83	[]	\N	2026-01-13 21:09:21.18+00	2026-01-13 21:09:21.18+00
1707	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1804	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1892	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1978	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2092	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2195	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2294	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2385	83	[]	\N	2026-01-13 21:09:21.98+00	2026-01-13 21:09:21.98+00
2484	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
645	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
766	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
866	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
965	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1071	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1207	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1311	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1465	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1634	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1709	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1800	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1883	83	[]	\N	2026-01-13 21:09:21.549+00	2026-01-13 21:09:21.549+00
1982	83	[]	\N	2026-01-13 21:09:21.597+00	2026-01-13 21:09:21.597+00
2109	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2198	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2293	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2383	83	[]	\N	2026-01-13 21:09:21.98+00	2026-01-13 21:09:21.98+00
2487	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
646	60	[]	\N	2025-12-08 23:22:49.26+00	2025-12-08 23:22:49.26+00
746	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
845	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
946	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1039	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1132	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1219	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1328	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1400	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1488	60	[]	\N	2025-12-08 23:22:49.797+00	2025-12-08 23:22:49.797+00
1614	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1711	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1810	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1894	83	[]	\N	2026-01-13 21:09:21.558+00	2026-01-13 21:09:21.558+00
1990	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2072	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2173	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2283	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2401	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
647	60	[]	\N	2025-12-08 23:22:49.26+00	2025-12-08 23:22:49.26+00
747	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
846	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
951	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1048	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1136	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1228	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1338	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1413	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1502	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1607	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1723	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1808	83	[]	\N	2026-01-13 21:09:21.45+00	2026-01-13 21:09:21.45+00
1897	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
1989	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2071	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2174	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2273	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2373	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2476	83	[]	\N	2026-01-13 21:09:22.106+00	2026-01-13 21:09:22.106+00
648	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
743	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
850	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
954	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1060	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1165	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1312	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1470	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1608	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1716	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1822	83	[]	\N	2026-01-13 21:09:21.477+00	2026-01-13 21:09:21.477+00
1915	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2023	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2112	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2211	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2290	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2393	83	[]	\N	2026-01-13 21:09:22.051+00	2026-01-13 21:09:22.051+00
649	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
742	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
840	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
940	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1032	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1125	60	[]	\N	2025-12-08 23:22:49.588+00	2025-12-08 23:22:49.588+00
1258	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1356	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1458	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1637	83	[]	\N	2026-01-13 21:09:21.14+00	2026-01-13 21:09:21.14+00
1718	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1778	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1850	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1942	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2034	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2134	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2222	83	[]	\N	2026-01-13 21:09:21.882+00	2026-01-13 21:09:21.882+00
2326	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2415	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
650	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
748	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
842	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
943	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1044	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1129	60	[]	\N	2025-12-08 23:22:49.605+00	2025-12-08 23:22:49.605+00
1225	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1337	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1409	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1500	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1639	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1706	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1785	83	[]	\N	2026-01-13 21:09:21.412+00	2026-01-13 21:09:21.412+00
1927	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2016	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2123	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2226	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2323	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2429	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
651	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
744	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
851	60	[]	\N	2025-12-08 23:22:49.444+00	2025-12-08 23:22:49.444+00
955	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1062	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1166	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1313	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1471	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1631	83	[]	\N	2026-01-13 21:09:21.141+00	2026-01-13 21:09:21.141+00
1720	83	[]	\N	2026-01-13 21:09:21.337+00	2026-01-13 21:09:21.337+00
1772	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1843	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1954	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2046	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2147	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2250	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2358	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2457	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
652	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
750	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
847	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
945	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1040	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1131	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1234	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1370	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1511	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1632	83	[]	\N	2026-01-13 21:09:21.176+00	2026-01-13 21:09:21.176+00
1715	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1762	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1839	83	[]	\N	2026-01-13 21:09:21.496+00	2026-01-13 21:09:21.496+00
1957	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2044	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2145	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2233	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2353	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2448	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
653	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
752	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
852	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
948	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1045	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1135	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1264	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1456	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1640	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1717	83	[]	\N	2026-01-13 21:09:21.307+00	2026-01-13 21:09:21.307+00
1773	83	[]	\N	2026-01-13 21:09:21.435+00	2026-01-13 21:09:21.435+00
1847	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1946	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2050	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2152	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2238	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2333	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2435	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
654	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
751	60	[]	\N	2025-12-08 23:22:49.336+00	2025-12-08 23:22:49.336+00
849	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
947	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1043	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1144	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1256	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1352	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1433	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1641	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1684	83	[]	\N	2026-01-13 21:09:21.306+00	2026-01-13 21:09:21.306+00
1818	83	[]	\N	2026-01-13 21:09:21.46+00	2026-01-13 21:09:21.46+00
1912	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2025	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2121	83	[]	\N	2026-01-13 21:09:21.76+00	2026-01-13 21:09:21.76+00
2221	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2321	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2427	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
655	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
753	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
853	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
949	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1046	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1145	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1257	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1355	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1435	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1528	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1642	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1750	83	[]	\N	2026-01-13 21:09:21.412+00	2026-01-13 21:09:21.412+00
1858	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1964	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2062	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2163	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2239	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2345	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2442	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
656	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
754	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
854	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
950	60	[]	\N	2025-12-08 23:22:49.512+00	2025-12-08 23:22:49.512+00
1050	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1146	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1259	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1357	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1459	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1643	83	[]	\N	2026-01-13 21:09:21.177+00	2026-01-13 21:09:21.177+00
1782	83	[]	\N	2026-01-13 21:09:21.361+00	2026-01-13 21:09:21.361+00
1934	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2030	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2129	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2263	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2354	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2447	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
657	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
756	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
856	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
956	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1053	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1151	60	[]	\N	2025-12-08 23:22:49.606+00	2025-12-08 23:22:49.606+00
1268	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1369	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1510	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1644	83	[]	\N	2026-01-13 21:09:21.177+00	2026-01-13 21:09:21.177+00
1752	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1869	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1959	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2058	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2137	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2231	83	[]	\N	2026-01-13 21:09:21.882+00	2026-01-13 21:09:21.882+00
2360	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2459	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
658	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
757	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
858	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
958	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1051	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1158	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1275	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1446	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1646	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1754	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1871	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1998	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2087	83	[]	\N	2026-01-13 21:09:21.668+00	2026-01-13 21:09:21.668+00
2212	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2286	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2379	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2478	83	[]	\N	2026-01-13 21:09:22.144+00	2026-01-13 21:09:22.144+00
659	60	[]	\N	2025-12-08 23:22:49.261+00	2025-12-08 23:22:49.261+00
759	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
861	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
961	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1059	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1155	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1271	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1372	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1514	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1647	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1755	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1926	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2012	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2116	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2216	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2306	83	[]	\N	2026-01-13 21:09:21.904+00	2026-01-13 21:09:21.904+00
2395	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
660	60	[]	\N	2025-12-08 23:22:49.278+00	2025-12-08 23:22:49.278+00
758	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
857	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
957	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1061	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1160	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1278	60	[]	\N	2025-12-08 23:22:49.661+00	2025-12-08 23:22:49.661+00
1451	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1648	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1742	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1837	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1958	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2065	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2162	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2242	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2346	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2443	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
661	60	[]	\N	2025-12-08 23:22:49.278+00	2025-12-08 23:22:49.278+00
762	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
862	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
962	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1056	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1154	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1270	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1441	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1649	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1751	83	[]	\N	2026-01-13 21:09:21.412+00	2026-01-13 21:09:21.412+00
1859	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1963	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2057	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2140	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2252	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2337	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2438	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
605	53	[]	\N	2025-11-26 17:19:25.835+00	2025-11-26 17:19:25.835+00
662	60	[]	\N	2025-12-08 23:22:49.278+00	2025-12-08 23:22:49.278+00
761	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
859	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
959	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1065	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1190	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1308	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1448	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1650	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1726	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1834	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1913	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2011	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2094	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2170	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2267	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2367	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2458	83	[]	\N	2026-01-13 21:09:22.102+00	2026-01-13 21:09:22.102+00
663	60	[]	\N	2025-12-08 23:22:49.278+00	2025-12-08 23:22:49.278+00
763	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
863	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
963	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1057	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1157	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1273	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1443	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1651	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1737	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1824	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1908	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2003	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2085	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2182	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2310	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2422	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
664	60	[]	\N	2025-12-08 23:22:49.278+00	2025-12-08 23:22:49.278+00
760	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
860	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
960	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1058	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1156	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1276	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1449	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1652	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1740	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1863	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1937	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2028	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2126	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2229	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2328	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2423	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
665	60	[]	\N	2025-12-08 23:22:49.278+00	2025-12-08 23:22:49.278+00
764	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
864	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
964	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1063	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1161	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1279	60	[]	\N	2025-12-08 23:22:49.661+00	2025-12-08 23:22:49.661+00
1452	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1653	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1736	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1826	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1906	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2002	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2083	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2189	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2291	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2389	83	[]	\N	2026-01-13 21:09:21.98+00	2026-01-13 21:09:21.98+00
2490	83	[]	\N	2026-01-13 21:09:22.145+00	2026-01-13 21:09:22.145+00
666	60	[]	\N	2025-12-08 23:22:49.278+00	2025-12-08 23:22:49.278+00
765	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
865	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
966	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1066	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1206	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1310	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1455	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1654	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1732	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1832	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1917	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2038	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2158	83	[]	\N	2026-01-13 21:09:21.802+00	2026-01-13 21:09:21.802+00
2247	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2331	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2433	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
667	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
767	60	[]	\N	2025-12-08 23:22:49.351+00	2025-12-08 23:22:49.351+00
867	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
967	60	[]	\N	2025-12-08 23:22:49.513+00	2025-12-08 23:22:49.513+00
1064	60	[]	\N	2025-12-08 23:22:49.559+00	2025-12-08 23:22:49.559+00
1189	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1297	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1438	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1655	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1738	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1823	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1916	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2018	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2103	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2200	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2287	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2374	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2482	83	[]	\N	2026-01-13 21:09:22.144+00	2026-01-13 21:09:22.144+00
668	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
769	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
869	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
970	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1069	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1138	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1253	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1350	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1431	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1656	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1731	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1828	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1921	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2024	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2119	83	[]	\N	2026-01-13 21:09:21.76+00	2026-01-13 21:09:21.76+00
2219	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2319	83	[]	\N	2026-01-13 21:09:21.976+00	2026-01-13 21:09:21.976+00
2378	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2473	83	[]	\N	2026-01-13 21:09:22.106+00	2026-01-13 21:09:22.106+00
669	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
770	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
868	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
969	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1068	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1169	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1245	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1332	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1404	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1491	60	[]	\N	2025-12-08 23:22:49.797+00	2025-12-08 23:22:49.797+00
1657	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1734	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1833	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1909	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2006	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2082	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2190	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2298	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2410	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
670	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
768	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
870	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
968	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1067	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1167	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1235	60	[]	\N	2025-12-08 23:22:49.661+00	2025-12-08 23:22:49.661+00
1322	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1395	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1479	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1658	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1730	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1829	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1919	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2042	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2142	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2234	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2351	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2451	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
671	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
772	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
872	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
972	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1075	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1139	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1222	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1323	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1392	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1477	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1659	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1728	83	[]	\N	2026-01-13 21:09:21.361+00	2026-01-13 21:09:21.361+00
1827	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1907	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2005	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2081	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2202	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2307	83	[]	\N	2026-01-13 21:09:21.952+00	2026-01-13 21:09:21.952+00
2409	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
672	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
771	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
871	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
971	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1070	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1188	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1293	60	[]	\N	2025-12-08 23:22:49.681+00	2025-12-08 23:22:49.681+00
1379	60	[]	\N	2025-12-08 23:22:49.722+00	2025-12-08 23:22:49.722+00
1506	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1660	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1733	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1835	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1904	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2007	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2089	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2192	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2304	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2398	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
673	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
773	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
873	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
973	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1072	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1168	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1238	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1320	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1390	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1476	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1662	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1729	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1825	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1905	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2004	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2086	83	[]	\N	2026-01-13 21:09:21.691+00	2026-01-13 21:09:21.691+00
2201	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2308	83	[]	\N	2026-01-13 21:09:21.952+00	2026-01-13 21:09:21.952+00
2419	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
674	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
776	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
877	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
976	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1081	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1177	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1239	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1330	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1402	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1490	60	[]	\N	2025-12-08 23:22:49.797+00	2025-12-08 23:22:49.797+00
1663	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1727	83	[]	\N	2026-01-13 21:09:21.361+00	2026-01-13 21:09:21.361+00
1831	83	[]	\N	2026-01-13 21:09:21.478+00	2026-01-13 21:09:21.478+00
1920	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2021	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2101	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2210	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2295	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2392	83	[]	\N	2026-01-13 21:09:22.007+00	2026-01-13 21:09:22.007+00
675	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
775	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
875	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
975	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1076	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1173	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1232	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1316	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1389	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1481	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1664	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1746	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1838	83	[]	\N	2026-01-13 21:09:21.496+00	2026-01-13 21:09:21.496+00
1952	83	[]	\N	2026-01-13 21:09:21.578+00	2026-01-13 21:09:21.578+00
2066	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2160	83	[]	\N	2026-01-13 21:09:21.822+00	2026-01-13 21:09:21.822+00
2240	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2341	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2441	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
676	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
774	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
874	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
974	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1074	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1172	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1263	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1354	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1399	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1487	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1665	83	[]	\N	2026-01-13 21:09:21.207+00	2026-01-13 21:09:21.207+00
1783	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1929	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2008	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2130	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2262	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2352	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2469	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
677	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
777	60	[]	\N	2025-12-08 23:22:49.37+00	2025-12-08 23:22:49.37+00
876	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
977	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1073	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1140	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1221	60	[]	\N	2025-12-08 23:22:49.639+00	2025-12-08 23:22:49.639+00
1317	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1387	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1475	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1645	83	[]	\N	2026-01-13 21:09:21.177+00	2026-01-13 21:09:21.177+00
1753	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1870	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
2000	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2076	83	[]	\N	2026-01-13 21:09:21.667+00	2026-01-13 21:09:21.667+00
2185	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2278	83	[]	\N	2026-01-13 21:09:21.903+00	2026-01-13 21:09:21.903+00
2391	83	[]	\N	2026-01-13 21:09:22.007+00	2026-01-13 21:09:22.007+00
678	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
780	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
880	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
978	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1078	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1174	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1231	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1385	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1494	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1666	83	[]	\N	2026-01-13 21:09:21.208+00	2026-01-13 21:09:21.208+00
1743	83	[]	\N	2026-01-13 21:09:21.363+00	2026-01-13 21:09:21.363+00
1864	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1938	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2029	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2128	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2261	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2350	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2445	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
679	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
779	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
881	60	[]	\N	2025-12-08 23:22:49.467+00	2025-12-08 23:22:49.467+00
980	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1079	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1175	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1237	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1318	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1388	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1482	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1725	83	[]	\N	2026-01-13 21:09:21.337+00	2026-01-13 21:09:21.337+00
1861	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1961	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2040	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2156	83	[]	\N	2026-01-13 21:09:21.771+00	2026-01-13 21:09:21.771+00
2235	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2332	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2416	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
680	60	[]	\N	2025-12-08 23:22:49.279+00	2025-12-08 23:22:49.279+00
778	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
878	60	[]	\N	2025-12-08 23:22:49.445+00	2025-12-08 23:22:49.445+00
982	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1084	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1179	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1246	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1334	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1408	60	[]	\N	2025-12-08 23:22:49.756+00	2025-12-08 23:22:49.756+00
1496	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1739	83	[]	\N	2026-01-13 21:09:21.361+00	2026-01-13 21:09:21.361+00
1923	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
2010	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2111	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2207	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2303	83	[]	\N	2026-01-13 21:09:21.904+00	2026-01-13 21:09:21.904+00
2407	83	[]	\N	2026-01-13 21:09:22.052+00	2026-01-13 21:09:22.052+00
681	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
781	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
879	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
979	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1077	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1170	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1230	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1319	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1391	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1474	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1744	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1862	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1960	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2060	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2139	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2255	83	[]	\N	2026-01-13 21:09:21.901+00	2026-01-13 21:09:21.901+00
2340	83	[]	\N	2026-01-13 21:09:21.978+00	2026-01-13 21:09:21.978+00
2455	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
682	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
782	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
883	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
981	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1082	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1176	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1291	60	[]	\N	2025-12-08 23:22:49.681+00	2025-12-08 23:22:49.681+00
1377	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1457	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1747	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1868	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1979	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2100	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2181	83	[]	\N	2026-01-13 21:09:21.824+00	2026-01-13 21:09:21.824+00
2272	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2371	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2471	83	[]	\N	2026-01-13 21:09:22.106+00	2026-01-13 21:09:22.106+00
683	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
783	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
882	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
983	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1083	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1171	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1233	60	[]	\N	2025-12-08 23:22:49.661+00	2025-12-08 23:22:49.661+00
1321	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1393	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1478	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1748	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1930	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2019	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2125	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2228	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2327	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2420	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
684	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
784	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
885	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
985	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1080	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1178	60	[]	\N	2025-12-08 23:22:49.607+00	2025-12-08 23:22:49.607+00
1295	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1382	60	[]	\N	2025-12-08 23:22:49.722+00	2025-12-08 23:22:49.722+00
1513	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1749	83	[]	\N	2026-01-13 21:09:21.337+00	2026-01-13 21:09:21.337+00
1867	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2020	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2127	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2260	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2364	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2468	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
685	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
785	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
884	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
984	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1087	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1183	60	[]	\N	2025-12-08 23:22:49.608+00	2025-12-08 23:22:49.608+00
1250	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1344	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1422	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1522	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1741	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1860	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
1962	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2059	83	[]	\N	2026-01-13 21:09:21.642+00	2026-01-13 21:09:21.642+00
2138	83	[]	\N	2026-01-13 21:09:21.77+00	2026-01-13 21:09:21.77+00
2256	83	[]	\N	2026-01-13 21:09:21.882+00	2026-01-13 21:09:21.882+00
2338	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2432	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
686	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
786	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
886	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
986	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1090	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1187	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1249	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1345	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1420	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1521	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1756	83	[]	\N	2026-01-13 21:09:21.361+00	2026-01-13 21:09:21.361+00
1866	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1976	83	[]	\N	2026-01-13 21:09:21.598+00	2026-01-13 21:09:21.598+00
2098	83	[]	\N	2026-01-13 21:09:21.643+00	2026-01-13 21:09:21.643+00
2178	83	[]	\N	2026-01-13 21:09:21.823+00	2026-01-13 21:09:21.823+00
2271	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2370	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2470	83	[]	\N	2026-01-13 21:09:22.106+00	2026-01-13 21:09:22.106+00
687	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
787	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
888	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
989	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1088	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1180	60	[]	\N	2025-12-08 23:22:49.608+00	2025-12-08 23:22:49.608+00
1266	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1360	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1462	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1758	83	[]	\N	2026-01-13 21:09:21.337+00	2026-01-13 21:09:21.337+00
1865	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
1940	83	[]	\N	2026-01-13 21:09:21.586+00	2026-01-13 21:09:21.586+00
2036	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2165	83	[]	\N	2026-01-13 21:09:21.802+00	2026-01-13 21:09:21.802+00
2264	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2356	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2449	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
688	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
788	60	[]	\N	2025-12-08 23:22:49.371+00	2025-12-08 23:22:49.371+00
887	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
987	60	[]	\N	2025-12-08 23:22:49.514+00	2025-12-08 23:22:49.514+00
1086	60	[]	\N	2025-12-08 23:22:49.56+00	2025-12-08 23:22:49.56+00
1181	60	[]	\N	2025-12-08 23:22:49.608+00	2025-12-08 23:22:49.608+00
1247	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1342	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1417	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1519	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1759	83	[]	\N	2026-01-13 21:09:21.361+00	2026-01-13 21:09:21.361+00
1924	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
2013	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2117	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2217	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2315	83	[]	\N	2026-01-13 21:09:21.976+00	2026-01-13 21:09:21.976+00
2425	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
689	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
789	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
889	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
988	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1085	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1182	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1294	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1439	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1530	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1764	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1872	83	[]	\N	2026-01-13 21:09:21.504+00	2026-01-13 21:09:21.504+00
2009	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2114	83	[]	\N	2026-01-13 21:09:21.692+00	2026-01-13 21:09:21.692+00
2213	83	[]	\N	2026-01-13 21:09:21.825+00	2026-01-13 21:09:21.825+00
2302	83	[]	\N	2026-01-13 21:09:21.904+00	2026-01-13 21:09:21.904+00
2390	83	[]	\N	2026-01-13 21:09:22.007+00	2026-01-13 21:09:22.007+00
690	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
790	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
890	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
990	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1089	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1184	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1248	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1343	60	[]	\N	2025-12-08 23:22:49.703+00	2025-12-08 23:22:49.703+00
1418	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1518	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1780	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1925	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2015	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2118	83	[]	\N	2026-01-13 21:09:21.76+00	2026-01-13 21:09:21.76+00
2218	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2316	83	[]	\N	2026-01-13 21:09:21.976+00	2026-01-13 21:09:21.976+00
2421	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
691	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
792	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
893	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
993	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1093	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1202	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1298	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1383	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1515	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1781	83	[]	\N	2026-01-13 21:09:21.362+00	2026-01-13 21:09:21.362+00
1928	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2017	83	[]	\N	2026-01-13 21:09:21.61+00	2026-01-13 21:09:21.61+00
2124	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2227	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2325	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2431	83	[]	\N	2026-01-13 21:09:22.053+00	2026-01-13 21:09:22.053+00
692	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
791	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
894	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
994	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1094	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1203	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1300	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1381	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1472	60	[]	\N	2025-12-08 23:22:49.761+00	2025-12-08 23:22:49.761+00
1757	83	[]	\N	2026-01-13 21:09:21.412+00	2026-01-13 21:09:21.412+00
1931	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2035	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2135	83	[]	\N	2026-01-13 21:09:21.769+00	2026-01-13 21:09:21.769+00
2224	83	[]	\N	2026-01-13 21:09:21.882+00	2026-01-13 21:09:21.882+00
2329	83	[]	\N	2026-01-13 21:09:21.977+00	2026-01-13 21:09:21.977+00
2434	83	[]	\N	2026-01-13 21:09:22.054+00	2026-01-13 21:09:22.054+00
693	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
793	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
892	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
992	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1092	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1200	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1292	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1384	60	[]	\N	2025-12-08 23:22:49.722+00	2025-12-08 23:22:49.722+00
1505	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
1784	83	[]	\N	2026-01-13 21:09:21.412+00	2026-01-13 21:09:21.412+00
1935	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2031	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2131	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2265	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2365	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2460	83	[]	\N	2026-01-13 21:09:22.102+00	2026-01-13 21:09:22.102+00
694	60	[]	\N	2025-12-08 23:22:49.294+00	2025-12-08 23:22:49.294+00
794	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
891	60	[]	\N	2025-12-08 23:22:49.468+00	2025-12-08 23:22:49.468+00
1000	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1099	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1193	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1243	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1326	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1397	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1484	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
1932	83	[]	\N	2026-01-13 21:09:21.532+00	2026-01-13 21:09:21.532+00
2032	83	[]	\N	2026-01-13 21:09:21.625+00	2026-01-13 21:09:21.625+00
2132	83	[]	\N	2026-01-13 21:09:21.761+00	2026-01-13 21:09:21.761+00
2266	83	[]	\N	2026-01-13 21:09:21.826+00	2026-01-13 21:09:21.826+00
2372	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2472	83	[]	\N	2026-01-13 21:09:22.106+00	2026-01-13 21:09:22.106+00
695	60	[]	\N	2025-12-08 23:22:49.295+00	2025-12-08 23:22:49.295+00
798	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
903	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1004	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1103	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1197	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1288	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1365	60	[]	\N	2025-12-08 23:22:49.722+00	2025-12-08 23:22:49.722+00
1426	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1936	83	[]	\N	2026-01-13 21:09:21.559+00	2026-01-13 21:09:21.559+00
2037	83	[]	\N	2026-01-13 21:09:21.626+00	2026-01-13 21:09:21.626+00
2166	83	[]	\N	2026-01-13 21:09:21.802+00	2026-01-13 21:09:21.802+00
2246	83	[]	\N	2026-01-13 21:09:21.902+00	2026-01-13 21:09:21.902+00
2359	83	[]	\N	2026-01-13 21:09:21.979+00	2026-01-13 21:09:21.979+00
2462	83	[]	\N	2026-01-13 21:09:22.055+00	2026-01-13 21:09:22.055+00
696	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
796	60	[]	\N	2025-12-08 23:22:49.394+00	2025-12-08 23:22:49.394+00
900	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1001	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1101	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1195	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1286	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1363	60	[]	\N	2025-12-08 23:22:49.705+00	2025-12-08 23:22:49.705+00
1421	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1520	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
697	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
802	60	[]	\N	2025-12-08 23:22:49.396+00	2025-12-08 23:22:49.396+00
899	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
998	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1097	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1185	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1244	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1327	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1398	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1485	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
698	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
803	60	[]	\N	2025-12-08 23:22:49.396+00	2025-12-08 23:22:49.396+00
905	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1003	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1102	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1194	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1287	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1364	60	[]	\N	2025-12-08 23:22:49.705+00	2025-12-08 23:22:49.705+00
1423	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1523	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
699	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
797	60	[]	\N	2025-12-08 23:22:49.395+00	2025-12-08 23:22:49.395+00
895	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
996	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1107	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1204	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1306	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1437	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1529	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
700	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
799	60	[]	\N	2025-12-08 23:22:49.395+00	2025-12-08 23:22:49.395+00
896	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
999	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1095	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1191	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1242	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1325	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1396	60	[]	\N	2025-12-08 23:22:49.729+00	2025-12-08 23:22:49.729+00
1483	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
701	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
800	60	[]	\N	2025-12-08 23:22:49.396+00	2025-12-08 23:22:49.396+00
897	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
991	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1091	60	[]	\N	2025-12-08 23:22:49.586+00	2025-12-08 23:22:49.586+00
1205	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1309	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1454	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
702	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
795	60	[]	\N	2025-12-08 23:22:49.395+00	2025-12-08 23:22:49.395+00
909	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1008	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1108	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1208	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1307	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1445	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
703	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
801	60	[]	\N	2025-12-08 23:22:49.396+00	2025-12-08 23:22:49.396+00
898	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
997	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1098	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1192	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1241	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1324	60	[]	\N	2025-12-08 23:22:49.683+00	2025-12-08 23:22:49.683+00
1394	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1480	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
704	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
805	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
901	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
995	60	[]	\N	2025-12-08 23:22:49.537+00	2025-12-08 23:22:49.537+00
1096	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1186	60	[]	\N	2025-12-08 23:22:49.637+00	2025-12-08 23:22:49.637+00
1240	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1315	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1386	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1473	60	[]	\N	2025-12-08 23:22:49.762+00	2025-12-08 23:22:49.762+00
705	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
808	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
908	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1007	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1106	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1201	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1299	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1380	60	[]	\N	2025-12-08 23:22:49.723+00	2025-12-08 23:22:49.723+00
1508	60	[]	\N	2025-12-08 23:22:49.798+00	2025-12-08 23:22:49.798+00
706	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
806	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
904	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1005	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1104	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1198	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1290	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1366	60	[]	\N	2025-12-08 23:22:49.722+00	2025-12-08 23:22:49.722+00
1428	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
707	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
804	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
911	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1010	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1109	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1280	60	[]	\N	2025-12-08 23:22:49.659+00	2025-12-08 23:22:49.659+00
1453	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
708	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
809	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
906	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1002	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1100	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1196	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1251	60	[]	\N	2025-12-08 23:22:49.662+00	2025-12-08 23:22:49.662+00
1347	60	[]	\N	2025-12-08 23:22:49.704+00	2025-12-08 23:22:49.704+00
1425	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
710	60	[]	\N	2025-12-08 23:22:49.305+00	2025-12-08 23:22:49.305+00
810	60	[]	\N	2025-12-08 23:22:49.409+00	2025-12-08 23:22:49.409+00
907	60	[]	\N	2025-12-08 23:22:49.487+00	2025-12-08 23:22:49.487+00
1006	60	[]	\N	2025-12-08 23:22:49.538+00	2025-12-08 23:22:49.538+00
1105	60	[]	\N	2025-12-08 23:22:49.587+00	2025-12-08 23:22:49.587+00
1199	60	[]	\N	2025-12-08 23:22:49.638+00	2025-12-08 23:22:49.638+00
1289	60	[]	\N	2025-12-08 23:22:49.682+00	2025-12-08 23:22:49.682+00
1367	60	[]	\N	2025-12-08 23:22:49.722+00	2025-12-08 23:22:49.722+00
1429	60	[]	\N	2025-12-08 23:22:49.757+00	2025-12-08 23:22:49.757+00
1524	60	[]	\N	2025-12-08 23:22:49.799+00	2025-12-08 23:22:49.799+00
120	53	[]	\N	2025-11-26 17:19:25.441+00	2025-11-26 17:19:25.441+00
\.


--
-- Data for Name: CallRecords; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."CallRecords" (id, "callId", type, status, "fromNumber", "toNumber", duration, "recordingUrl", "contactId", "whatsappId", "ticketId", "userId", "companyId", "callStartedAt", "callEndedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CampaignSettings; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."CampaignSettings" (id, key, value, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CampaignShipping; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."CampaignShipping" (id, "jobId", number, message, "confirmationMessage", confirmation, "contactId", "campaignId", "confirmationRequestedAt", "confirmedAt", "deliveredAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Campaigns; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Campaigns" (id, name, message1, message2, message3, message4, message5, "confirmationMessage1", "confirmationMessage2", "confirmationMessage3", "confirmationMessage4", "confirmationMessage5", status, confirmation, "mediaPath", "mediaName", "companyId", "contactListId", "whatsappId", "scheduledAt", "completedAt", "createdAt", "updatedAt", "userId", "queueId", "statusTicket", "openTicket") FROM stdin;
\.


--
-- Data for Name: ChatMessages; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ChatMessages" (id, "chatId", "senderId", message, "mediaPath", "mediaName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatUsers; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ChatUsers" (id, "chatId", "userId", unreads, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Chatbots; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Chatbots" (id, name, "queueId", "chatbotId", "greetingMessage", "createdAt", "updatedAt", "isAgent", "optQueueId", "optUserId", "queueType", "optIntegrationId", "optFileId", "closeTicket") FROM stdin;
\.


--
-- Data for Name: Chats; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Chats" (id, title, uuid, "ownerId", "lastMessage", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Companies; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Companies" (id, name, phone, email, "createdAt", "updatedAt", "planId", status, schedules, "dueDate", recurrence, document, "paymentMethod", "lastLogin", "folderSize", "numberFileFolder", "updatedAtFolder", type, segment, "loadingImage", "affiliateId", "couponId", "referredBy", "affiliateLinkId") FROM stdin;
157	Thrivex	5592994235447	thiagocorreaoficial121212@gmail.com	2026-02-22 16:47:48.255+00	2026-02-22 19:23:34.421+00	1	t	[]	2026-02-27 16:47:45+00	MENSAL	05804199242		2026-02-22 19:23:34.42+00	\N	\N	\N	pf	outros	\N	\N	\N	\N	\N
156	Link System	5562992330591	teste@gmail.com	2026-02-21 16:28:47.935+00	2026-02-23 13:01:49.033+00	1	t	[]	2026-02-26 16:28:45+00	MENSAL	05074409195		2026-02-23 13:01:49.033+00	\N	\N	\N	pf	outros	\N	\N	\N	\N	\N
1	Empresa Admin - Não Deletar	\N	\N	2025-10-10 02:50:00.266+00	2026-02-24 18:38:36.613+00	1	t	[]	2099-12-31 03:00:00+00				2026-02-24 18:38:36.613+00	\N	\N	\N	pf	outros	\N	\N	\N	\N	\N
158	teste	5569993256149	teste3@teste3.com	2026-02-24 21:13:44.479+00	2026-02-24 21:13:58.192+00	1	t	[]	2026-03-01 21:13:42+00	MENSAL	46151060091		2026-02-24 21:13:58.192+00	\N	\N	\N	pf	outros	\N	\N	\N	\N	\N
\.


--
-- Data for Name: CompaniesSettings; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."CompaniesSettings" (id, "companyId", "hoursCloseTicketsAuto", "chatBotType", "acceptCallWhatsapp", "userRandom", "sendGreetingMessageOneQueues", "sendSignMessage", "sendFarewellWaitingTicket", "userRating", "sendGreetingAccepted", "CheckMsgIsGroup", "sendQueuePosition", "scheduleType", "acceptAudioMessageContact", "enableLGPD", "sendMsgTransfTicket", "requiredTag", "lgpdDeleteMessage", "lgpdHideNumber", "lgpdConsent", "lgpdLink", "lgpdMessage", "createdAt", "updatedAt", "DirectTicketsToWallets", "closeTicketOnTransfer", "greetingAcceptedMessage", "AcceptCallWhatsappMessage", "sendQueuePositionMessage", "transferMessage", "showNotificationPending", "notificameHub", "autoSaveContacts", "autoSaveContactsScore", "autoSaveContactsReason") FROM stdin;
116	157	9999999999	text	enabled	enabled	enabled	enabled	disabled	disabled	enabled	enabled	disabled	disabled	enabled	disabled	disabled	disabled	disabled	disabled	disabled			2026-02-22 16:47:48.341+00	2026-02-22 16:47:48.342+00	f	f					f	\N	disabled	7	high_potential
115	156	9999999999	text	enabled	enabled	enabled	enabled	disabled	disabled	enabled	enabled	disabled	disabled	enabled	disabled	disabled	disabled	disabled	disabled	disabled			2026-02-21 16:28:47.972+00	2026-02-21 16:28:47.973+00	f	f					f	\N	disabled	7	high_potential
117	158	9999999999	text	enabled	enabled	enabled	enabled	disabled	disabled	enabled	enabled	disabled	disabled	enabled	disabled	disabled	disabled	disabled	disabled	disabled			2026-02-24 21:13:44.547+00	2026-02-24 21:13:44.548+00	f	f					f	\N	disabled	7	high_potential
1	1	9999999999	text	enabled	enabled	enabled	enabled	disabled	disabled	enabled	enabled	enabled	disabled	enabled	disabled	enabled	disabled	disabled	disabled	disabled			2025-10-10 02:50:00.34+00	2026-01-25 00:12:15.718+00	f	f					f		enabled	7	message_analysis
\.


--
-- Data for Name: ContactCustomFields; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ContactCustomFields" (id, name, value, "contactId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContactGroups; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ContactGroups" (id, "createdAt", "updatedAt", "contactId", "companyId", "userId") FROM stdin;
\.


--
-- Data for Name: ContactListItems; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ContactListItems" (id, name, number, email, "contactListId", "isWhatsappValid", "companyId", "createdAt", "updatedAt", "isGroup") FROM stdin;
\.


--
-- Data for Name: ContactLists; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ContactLists" (id, name, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContactTags; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ContactTags" ("contactId", "tagId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContactWallets; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ContactWallets" (id, "walletId", "contactId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Contacts; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Contacts" (id, name, number, "profilePicUrl", "createdAt", "updatedAt", email, "isGroup", "companyId", "acceptAudioMessage", channel, active, "disableBot", "remoteJid", "lgpdAcceptedAt", "urlPicture", "pictureUpdated", "whatsappId", "isLid", birthday, anniversary, info, files, "cpfCnpj", address, lid, "savedToPhone", "savedToPhoneAt", "savedToPhoneReason", "potentialScore", "isPotential", "lidStability") FROM stdin;
\.


--
-- Data for Name: Coupons; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Coupons" (id, name, code, "discountType", "discountValue", "minPlanAmount", "maxUses", "usedCount", "validUntil", "isActive", description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DialogChatBots; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."DialogChatBots" (id, awaiting, "contactId", "chatbotId", "createdAt", "updatedAt", "queueId") FROM stdin;
\.


--
-- Data for Name: Faturas; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Faturas" (id, "companyId", "contactId", valor, descricao, status, "dataCriacao", "dataVencimento", "dataPagamento", recorrente, intervalo, "proximaCobranca", "limiteRecorrencias", "recorrenciasRealizadas", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Ferramentas; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Ferramentas" (id, nome, descricao, url, metodo, headers, body, query_params, placeholders, status, "createdAt", "updatedAt", "companyId") FROM stdin;
7	VerificarCep	Consulta CEP usando a API ViaCEP.\n\nUse com a função execute_tool:\n- ferramentaNome: "ConsultaCEP"\n- cep: string com 8 dígitos numéricos (sem traço).\n\nExemplo correto:\n{\n  "ferramentaNome": "ConsultaCEP",\n  "cep": "27537284"\n}\n\nA URL usa o placeholder {{cep}}: https://viacep.com.br/ws/{{cep}}/json/\nCampos relevantes da resposta:\n- logradouro\n- bairro\n- localidade\n- uf\n- cep	https://viacep.com.br/ws/{{cep}}/json/	GET	{}	{}	{}	{}	ativo	2025-11-18 01:52:05.656	2025-11-18 01:52:05.656	\N
\.


--
-- Data for Name: Files; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Files" (id, "companyId", name, message, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FilesOptions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."FilesOptions" (id, name, path, "fileId", "createdAt", "updatedAt", "mediaType") FROM stdin;
\.


--
-- Data for Name: FlowAudios; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."FlowAudios" (id, "companyId", "userId", name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FlowBuilders; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."FlowBuilders" (id, user_id, name, active, flow, "createdAt", "updatedAt", company_id, variables) FROM stdin;
2	2	vxv	t	\N	2025-10-10 05:11:31.309+00	2025-10-10 05:11:31.309+00	2	\N
6	13	teste	t	\N	2025-10-20 03:12:14.174+00	2025-10-20 03:12:14.174+00	9	\N
5	3	teste	t	{"nodes":[{"id":"1","position":{"x":-40,"y":36.5},"data":{"label":"Inicio do fluxo"},"type":"start","width":280,"height":228,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"},"positionAbsolute":{"x":-40,"y":36.5},"dragging":false},{"id":"PnlN8cEYX36WJrz99umPq4Yv3dHPab","position":{"x":759.9617700487375,"y":-66.79097164952915},"data":{"message":"Em que posso ajudar?","arrayOption":[{"number":1,"value":"Vendas"},{"number":2,"value":"Financeiro"}]},"type":"menu","width":280,"height":325,"style":{"backgroundColor":"#3b82f6","padding":1,"borderRadius":8,"pointerEvents":"auto"},"selected":false,"positionAbsolute":{"x":759.9617700487375,"y":-66.79097164952915},"dragging":false},{"id":"tp7j8Cts7sPzmktdPvb7EJMQ14Mx40","position":{"x":224.45352193176734,"y":-230.67079839920854},"data":{"seq":["message0"],"elements":[{"type":"message","value":"{{firstName}}, seja bem vndo ao chatbot","number":"message0"}]},"type":"singleBlock","width":300,"height":228,"selected":false,"positionAbsolute":{"x":224.45352193176734,"y":-230.67079839920854},"dragging":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"XorWtCD9nR27H04lM5t7b0Anf8kQZG","position":{"x":1169.0497189235225,"y":-102.90008601810257},"data":{"data":{"id":4,"name":"aaaa","color":"#BA0909","greetingMessage":"aaaaaaaaaaa","orderQueue":null,"ativarRoteador":true,"tempoRoteador":2,"outOfHoursMessage":"","schedules":[{"weekday":"Segunda-feira","endTimeA":"12:00","endTimeB":"23:00","weekdayEn":"monday","startTimeA":"08:00","startTimeB":"12:01"},{"weekday":"Terça-feira","endTimeA":"12:00","endTimeB":"23:00","weekdayEn":"tuesday","startTimeA":"08:00","startTimeB":"12:01"},{"weekday":"Quarta-feira","endTimeA":"12:00","endTimeB":"23:00","weekdayEn":"wednesday","startTimeA":"08:00","startTimeB":"12:01"},{"weekday":"Quinta-feira","endTimeA":"12:00","endTimeB":"23:00","weekdayEn":"thursday","startTimeA":"08:00","startTimeB":"12:01"},{"weekday":"Sexta-feira","endTimeA":"12:00","endTimeB":"23:00","weekdayEn":"friday","startTimeA":"08:00","startTimeB":"12:01"},{"weekday":"Sábado","endTimeA":"12:00","endTimeB":"23:00","weekdayEn":"saturday","startTimeA":"08:00","startTimeB":"12:01"},{"weekday":"Domingo","endTimeA":"12:00","endTimeB":"23:00","weekdayEn":"sunday","startTimeA":"08:00","startTimeB":"12:01"}],"companyId":3,"integrationId":null,"fileListId":null,"closeTicket":false,"createdAt":"2025-10-21T18:21:04.149Z","updatedAt":"2025-10-21T18:21:04.149Z"}},"type":"ticket","width":280,"height":290,"selected":false,"positionAbsolute":{"x":1169.0497189235225,"y":-102.90008601810257},"dragging":false}],"connections":[{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1425","source":"1","sourceHandle":"a","target":"tp7j8Cts7sPzmktdPvb7EJMQ14Mx40","targetHandle":null,"id":"reactflow__edge-1a-tp7j8Cts7sPzmktdPvb7EJMQ14Mx40","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1425","source":"tp7j8Cts7sPzmktdPvb7EJMQ14Mx40","sourceHandle":"a","target":"PnlN8cEYX36WJrz99umPq4Yv3dHPab","targetHandle":null,"id":"reactflow__edge-tp7j8Cts7sPzmktdPvb7EJMQ14Mx40a-PnlN8cEYX36WJrz99umPq4Yv3dHPab","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1425","source":"PnlN8cEYX36WJrz99umPq4Yv3dHPab","sourceHandle":"a1","target":"XorWtCD9nR27H04lM5t7b0Anf8kQZG","targetHandle":null,"id":"reactflow__edge-PnlN8cEYX36WJrz99umPq4Yv3dHPaba1-XorWtCD9nR27H04lM5t7b0Anf8kQZG"},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1425","source":"PnlN8cEYX36WJrz99umPq4Yv3dHPab","sourceHandle":"a2","target":"XorWtCD9nR27H04lM5t7b0Anf8kQZG","targetHandle":null,"id":"reactflow__edge-PnlN8cEYX36WJrz99umPq4Yv3dHPaba2-XorWtCD9nR27H04lM5t7b0Anf8kQZG"}]}	2025-10-11 22:45:37.959+00	2025-10-21 18:27:47.948+00	3	\N
7	3	rapido	t	\N	2025-10-28 21:42:12.109+00	2025-10-28 21:42:12.109+00	3	\N
8	22	Teste	t	\N	2025-11-13 17:09:11.345+00	2025-11-13 17:09:11.345+00	18	\N
9	25	teste	t	\N	2025-11-16 16:14:50.141+00	2025-11-16 16:14:50.141+00	26	\N
10	25	rrr	t	\N	2025-11-17 19:38:02.675+00	2025-11-17 19:38:02.675+00	26	\N
11	34	teste	t	\N	2025-11-19 15:40:36.263+00	2025-11-19 15:40:36.263+00	35	\N
12	27	fluxo 01	t	\N	2025-11-19 22:39:52.578+00	2025-11-19 22:39:52.578+00	28	\N
13	39	fer	t	\N	2025-11-24 00:31:57.814+00	2025-11-24 00:31:57.814+00	40	\N
14	41	teste	t	\N	2025-11-24 20:14:33.085+00	2025-11-24 20:14:33.085+00	42	\N
15	46	comercial	t	\N	2025-11-26 19:51:44.662+00	2025-11-26 19:51:44.662+00	46	\N
16	43	Jefferson	t	{"nodes":[{"id":"1","position":{"x":250,"y":100},"data":{"label":"Inicio do fluxo"},"type":"start","width":280,"height":229,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"},"selected":false},{"id":"l8EUG2gXHP9cOHS3VEIymgqaqYW8ha","position":{"x":570,"y":100},"data":{"message":"Selecione","arrayOption":[{"number":1,"value":"Fatura"},{"number":2,"value":"Suporte"},{"number":3,"value":"Comercial"}]},"type":"menu","width":280,"height":384,"selected":false,"style":{"backgroundColor":"#3b82f6","padding":1,"borderRadius":8,"pointerEvents":"auto"}},{"id":"O8pOB61sN5q7WGbUZmsHSlyrGOkrEe","position":{"x":890,"y":100},"data":{"seq":["message0"],"elements":[{"type":"message","value":"Em breve você será atendido aguarde..","number":"message0"}]},"type":"singleBlock","width":300,"height":228,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}}],"connections":[{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1178","source":"1","sourceHandle":"a","target":"l8EUG2gXHP9cOHS3VEIymgqaqYW8ha","targetHandle":null,"id":"reactflow__edge-1a-l8EUG2gXHP9cOHS3VEIymgqaqYW8ha","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1178","source":"l8EUG2gXHP9cOHS3VEIymgqaqYW8ha","sourceHandle":"a2","target":"O8pOB61sN5q7WGbUZmsHSlyrGOkrEe","targetHandle":null,"id":"reactflow__edge-l8EUG2gXHP9cOHS3VEIymgqaqYW8haa2-O8pOB61sN5q7WGbUZmsHSlyrGOkrEe","selected":false}]}	2025-11-27 16:38:58.763+00	2025-11-27 16:42:02.427+00	44	\N
19	67	teste	t	{"nodes":[{"id":"1","position":{"x":-377,"y":-175.5},"data":{"label":"Inicio do fluxo"},"type":"start","width":280,"height":229,"selected":false,"positionAbsolute":{"x":-377,"y":-175.5},"dragging":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"d4TXklDIc0IVgzREZsFYnZHoJP7Kbk","position":{"x":-43,"y":-159},"data":{"seq":["message0"],"elements":[{"type":"message","value":"olá tudo bem?","number":"message0"}]},"type":"singleBlock","width":302,"height":220,"selected":false,"positionAbsolute":{"x":-43,"y":-159},"dragging":false,"style":{"backgroundColor":"#3b82f6","padding":1,"borderRadius":8,"pointerEvents":"auto"}},{"id":"VPLV48355gJlBSyscRTQiikYU4TQXx","position":{"x":299,"y":-159},"data":{"seq":["interval0"],"elements":[{"type":"interval","value":"02","number":"interval0"}]},"type":"singleBlock","width":300,"height":218}],"connections":[{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1430","source":"1","sourceHandle":"a","target":"d4TXklDIc0IVgzREZsFYnZHoJP7Kbk","targetHandle":null,"id":"reactflow__edge-1a-d4TXklDIc0IVgzREZsFYnZHoJP7Kbk","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1430","source":"d4TXklDIc0IVgzREZsFYnZHoJP7Kbk","sourceHandle":"a","target":"VPLV48355gJlBSyscRTQiikYU4TQXx","targetHandle":null,"id":"reactflow__edge-d4TXklDIc0IVgzREZsFYnZHoJP7Kbka-VPLV48355gJlBSyscRTQiikYU4TQXx"}]}	2025-12-12 12:43:58.539+00	2025-12-12 12:45:24.96+00	67	\N
20	59	fda	t	\N	2025-12-12 18:52:25.375+00	2025-12-12 18:52:25.375+00	59	\N
17	51	TEste	t	\N	2025-11-30 04:03:09.439+00	2025-11-30 04:03:09.439+00	51	\N
18	58	asa	t	{"nodes":[{"id":"1","position":{"x":250,"y":100},"data":{"label":"Inicio do fluxo"},"type":"start","width":280,"height":228,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"FaaiFnrGaOjfOOlvsCLaKHNzamnGqu","position":{"x":570,"y":100},"data":{"seq":[],"elements":[]},"type":"singleBlock","width":300,"height":155,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"EhZwzExNM70wpR34HPYLBRZsuUNGiA","position":{"x":694.730516212747,"y":358.9960976815389},"data":{"seq":[],"elements":[]},"type":"singleBlock","width":300,"height":155,"selected":false,"positionAbsolute":{"x":694.730516212747,"y":358.9960976815389},"dragging":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"OSFmaHxZs3ftUiwcEfUYjazsPpRRLp","position":{"x":1056.3897873270957,"y":494.46069185306567},"data":{"seq":[],"elements":[]},"type":"singleBlock","width":300,"height":155,"selected":false,"positionAbsolute":{"x":1056.3897873270957,"y":494.46069185306567},"dragging":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"QjkK5UIsCPcoorlN9PAnkiM6ndDba0","position":{"x":1396.3897873270957,"y":494.46069185306567},"data":{"seq":[],"elements":[]},"type":"singleBlock","width":300,"height":155,"selected":false,"style":{"backgroundColor":"#3b82f6","padding":1,"borderRadius":8,"pointerEvents":"auto"}}],"connections":[{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss816","source":"1","sourceHandle":"a","target":"FaaiFnrGaOjfOOlvsCLaKHNzamnGqu","targetHandle":null,"id":"reactflow__edge-1a-FaaiFnrGaOjfOOlvsCLaKHNzamnGqu","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss816","source":"FaaiFnrGaOjfOOlvsCLaKHNzamnGqu","sourceHandle":"a","target":"EhZwzExNM70wpR34HPYLBRZsuUNGiA","targetHandle":null,"id":"reactflow__edge-FaaiFnrGaOjfOOlvsCLaKHNzamnGqua-EhZwzExNM70wpR34HPYLBRZsuUNGiA","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss816","source":"EhZwzExNM70wpR34HPYLBRZsuUNGiA","sourceHandle":"a","target":"OSFmaHxZs3ftUiwcEfUYjazsPpRRLp","targetHandle":null,"id":"reactflow__edge-EhZwzExNM70wpR34HPYLBRZsuUNGiAa-OSFmaHxZs3ftUiwcEfUYjazsPpRRLp","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss816","source":"OSFmaHxZs3ftUiwcEfUYjazsPpRRLp","sourceHandle":"a","target":"QjkK5UIsCPcoorlN9PAnkiM6ndDba0","targetHandle":null,"id":"reactflow__edge-OSFmaHxZs3ftUiwcEfUYjazsPpRRLpa-QjkK5UIsCPcoorlN9PAnkiM6ndDba0"}]}	2025-12-08 01:46:57.614+00	2025-12-08 05:04:37.029+00	58	\N
22	73	dfgggggg	t	\N	2026-01-01 15:56:00.615+00	2026-01-01 15:56:00.615+00	73	\N
23	74	Atendimento	t	\N	2026-01-02 21:05:03.228+00	2026-01-02 21:05:03.228+00	74	\N
24	82	teste	t	\N	2026-01-05 12:13:48.456+00	2026-01-05 12:13:48.456+00	84	\N
26	87	teste	t	{"nodes":[{"id":"1","position":{"x":-91.79408574809474,"y":13.604155708907285},"data":{"label":"Inicio do fluxo","title":"Início do Fluxo"},"type":"start","width":282,"height":231,"selected":false,"positionAbsolute":{"x":-91.79408574809474,"y":13.604155708907285},"dragging":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"pgVwBtgAmmiQwYBTgPy3GXeylo7giu","position":{"x":228.20591425190526,"y":13.604155708907285},"data":{"message":"Por favor escolha uma das opções","arrayOption":[{"number":1,"value":"Suporte"},{"number":2,"value":"Vendas"}],"title":"Menu"},"type":"menu","width":280,"height":340,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"hQX2e3lkMThxzNsIvsHPhWmd8qTOLR","position":{"x":548.2059142519053,"y":13.604155708907285},"data":{"seq":["message0"],"elements":[{"type":"message","value":"Bem vindo ao suporte","number":"message0"}],"title":"Conteúdo"},"type":"singleBlock","width":300,"height":218,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"id":"dZiKCJg6YUbnYjpY83wps6qU1ivMvX","position":{"x":888.2059142519053,"y":13.604155708907285},"data":{"typebotIntegration":{"message":"Qual seu nome?","answerKey":"nome"},"title":"Pergunta"},"type":"question","width":280,"height":240,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"width":280,"height":240,"id":"97Vo8vDMhApZ0gqlBYgFHt30DUgKsn","position":{"x":1653.6563934851322,"y":39.14664772168683},"data":{"typebotIntegration":{"message":"Qual sua cidade?","answerKey":"cidade"},"title":"Pergunta"},"type":"question","selected":true,"positionAbsolute":{"x":1653.6563934851322,"y":39.14664772168683},"dragging":false,"style":{"backgroundColor":"#3b82f6","padding":1,"borderRadius":8,"pointerEvents":"auto"}},{"id":"Ei6gqHbfyeTkS2szTGeHXwDy8Cpxzm","position":{"x":1258.4666171273045,"y":90.23163174724593},"data":{"seq":["message0"],"elements":[{"type":"message","value":"ok {{nome}}","number":"message0"}],"title":"Conteúdo"},"type":"singleBlock","width":300,"height":228,"selected":false,"positionAbsolute":{"x":1258.4666171273045,"y":90.23163174724593},"dragging":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}}],"connections":[{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss911","source":"1","sourceHandle":"a","target":"pgVwBtgAmmiQwYBTgPy3GXeylo7giu","targetHandle":null,"id":"reactflow__edge-1a-pgVwBtgAmmiQwYBTgPy3GXeylo7giu","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1650","source":"pgVwBtgAmmiQwYBTgPy3GXeylo7giu","sourceHandle":"a1","target":"hQX2e3lkMThxzNsIvsHPhWmd8qTOLR","targetHandle":null,"id":"reactflow__edge-pgVwBtgAmmiQwYBTgPy3GXeylo7giua1-hQX2e3lkMThxzNsIvsHPhWmd8qTOLR","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1650","source":"hQX2e3lkMThxzNsIvsHPhWmd8qTOLR","sourceHandle":"a","target":"dZiKCJg6YUbnYjpY83wps6qU1ivMvX","targetHandle":null,"id":"reactflow__edge-hQX2e3lkMThxzNsIvsHPhWmd8qTOLRa-dZiKCJg6YUbnYjpY83wps6qU1ivMvX","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss853","source":"dZiKCJg6YUbnYjpY83wps6qU1ivMvX","sourceHandle":"a","target":"Ei6gqHbfyeTkS2szTGeHXwDy8Cpxzm","targetHandle":null,"id":"reactflow__edge-dZiKCJg6YUbnYjpY83wps6qU1ivMvXa-Ei6gqHbfyeTkS2szTGeHXwDy8Cpxzm","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss853","source":"Ei6gqHbfyeTkS2szTGeHXwDy8Cpxzm","sourceHandle":"a","target":"97Vo8vDMhApZ0gqlBYgFHt30DUgKsn","targetHandle":null,"id":"reactflow__edge-Ei6gqHbfyeTkS2szTGeHXwDy8Cpxzma-97Vo8vDMhApZ0gqlBYgFHt30DUgKsn","selected":false}]}	2026-01-07 19:09:48.285+00	2026-01-08 01:36:38.606+00	88	\N
27	90	Teste	t	\N	2026-01-08 19:16:36.518+00	2026-01-08 19:16:36.518+00	91	\N
28	104	Fluxo teste	t	\N	2026-01-14 16:11:53.256+00	2026-01-14 16:11:53.256+00	104	\N
32	109	teste	t	\N	2026-01-23 23:01:00.332+00	2026-01-23 23:01:00.332+00	108	\N
49	125	Autmacao2	t	\N	2026-01-29 23:29:47.266+00	2026-01-29 23:29:47.266+00	122	\N
50	125	Automacao3	t	\N	2026-01-29 23:29:53.635+00	2026-01-29 23:29:53.635+00	122	\N
48	125	Automacao1	t	{"nodes":[{"id":"1","position":{"x":250,"y":100},"data":{"label":"Inicio do fluxo","title":"Início do Fluxo"},"type":"start","width":280,"height":229,"selected":false,"style":{"backgroundColor":"#ffffff","padding":0,"borderRadius":8,"pointerEvents":"auto"}},{"width":300,"height":156,"id":"3oNBqUxROAxNF54tW0HgBDgBCy3DO1","position":{"x":610.0453259116218,"y":91.29449436703874},"data":{"seq":[],"elements":[],"title":"Conteúdo"},"type":"singleBlock","selected":false,"positionAbsolute":{"x":610.0453259116218,"y":91.29449436703874},"dragging":false,"style":{"backgroundColor":"#3b82f6","padding":1,"borderRadius":8,"pointerEvents":"auto"}},{"id":"QvFrxBsbyNZm9TCM08FwjrGa087Zaq","position":{"x":1038.8414833678264,"y":14.686044796979843},"data":{"typebotIntegration":{"message":"Qual o seu nome?","answerKey":"name"},"title":"Pergunta"},"type":"question","width":280,"height":240,"selected":false,"positionAbsolute":{"x":1038.8414833678264,"y":14.686044796979843},"dragging":false}],"connections":[{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1093","source":"1","sourceHandle":"a","target":"3oNBqUxROAxNF54tW0HgBDgBCy3DO1","targetHandle":null,"id":"reactflow__edge-1a-3oNBqUxROAxNF54tW0HgBDgBCy3DO1","selected":false},{"style":{"stroke":"#6366f1","strokeWidth":"3px"},"animated":true,"className":"jss1093","source":"3oNBqUxROAxNF54tW0HgBDgBCy3DO1","sourceHandle":"a","target":"QvFrxBsbyNZm9TCM08FwjrGa087Zaq","targetHandle":null,"id":"reactflow__edge-3oNBqUxROAxNF54tW0HgBDgBCy3DO1a-QvFrxBsbyNZm9TCM08FwjrGa087Zaq","selected":false}]}	2026-01-29 23:29:39.523+00	2026-01-29 23:32:14.816+00	122	\N
51	125	teste	t	\N	2026-01-29 23:43:45.69+00	2026-01-29 23:43:45.69+00	122	\N
56	131	czxczx	t	\N	2026-02-03 04:37:54.007+00	2026-02-03 04:37:54.007+00	132	\N
71	7	teste	t	\N	2026-02-21 16:29:29.288+00	2026-02-21 16:29:29.288+00	156	\N
\.


--
-- Data for Name: FlowCampaigns; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."FlowCampaigns" (id, "companyId", "userId", name, "flowId", phrase, status, "createdAt", "updatedAt", "whatsappId", phrases, "matchType") FROM stdin;
\.


--
-- Data for Name: FlowDefaults; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."FlowDefaults" (id, "companyId", "userId", "flowIdWelcome", "flowIdNotPhrase", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FlowImgs; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."FlowImgs" (id, "companyId", "userId", name, "createdAt", "updatedAt") FROM stdin;
1	1	1	documentacao_api_focus_cidadao_1767334301947.pdf	2026-01-02 06:11:41.959+00	2026-01-02 06:11:41.959+00
2	1	1	funcionalidades_1767731278440.pdf	2026-01-06 20:27:58.448+00	2026-01-06 20:27:58.448+00
3	1	1	atualiza_o_1_1767759820124.png	2026-01-07 04:23:40.163+00	2026-01-07 04:23:40.163+00
4	1	1	promocao_1767762204674.png	2026-01-07 05:03:24.707+00	2026-01-07 05:03:24.707+00
5	1	1	valornovo_1767762967229.pdf	2026-01-07 05:16:07.232+00	2026-01-07 05:16:07.232+00
6	1	1	valornovo_1767762970374.png	2026-01-07 05:16:10.414+00	2026-01-07 05:16:10.414+00
7	1	1	valornovo_1_1767763869245.png	2026-01-07 05:31:09.283+00	2026-01-07 05:31:09.283+00
8	1	1	funcionalidades_1767764123491.pdf	2026-01-07 05:35:23.496+00	2026-01-07 05:35:23.496+00
9	1	1	valornovo_1767764129413.png	2026-01-07 05:35:29.417+00	2026-01-07 05:35:29.417+00
16	1	1	valornovo_1769361353103.png	2026-01-25 17:15:53.112+00	2026-01-25 17:15:53.112+00
17	1	1	Ativar_agente_de_IA_1769632520717.mp4	2026-01-28 20:35:20.776+00	2026-01-28 20:35:20.776+00
18	1	1	overviw_1769801512863.mp4	2026-01-30 19:31:53.118+00	2026-01-30 19:31:53.118+00
\.


--
-- Data for Name: GoogleCalendarIntegrations; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."GoogleCalendarIntegrations" (id, "companyId", "googleUserId", email, "accessToken", "refreshToken", "expiryDate", "calendarId", "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: GoogleSheetsTokens; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."GoogleSheetsTokens" (id, "companyId", "googleUserId", email, "accessToken", "refreshToken", "expiryDate", "rawTokens", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Helps; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Helps" (id, title, description, video, link, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: IaWorkflows; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."IaWorkflows" (id, "companyId", "orchestratorPromptId", "agentPromptId", alias, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Integrations; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Integrations" (id, "companyId", name, "isActive", token, "foneContact", "userLogin", "passLogin", "finalCurrentMonth", "initialCurrentMonth", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoices; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Invoices" (id, "companyId", "dueDate", detail, status, value, users, connections, queues, "useWhatsapp", "useFacebook", "useInstagram", "useCampaigns", "useSchedules", "useInternalChat", "useExternalApi", "createdAt", "updatedAt", "linkInvoice") FROM stdin;
1	1	2099-12-31T00:00:00-03:00	Plano 1	open	100	10	10	10	t	t	t	t	t	t	t	2025-10-10 02:50:30+00	2025-10-10 02:50:30+00	
126	156	2026-02-26T13:28:45-03:00	Plano 1	open	100	10	10	10	t	t	t	t	t	t	t	2026-02-21 16:29:00+00	2026-02-21 16:29:00+00	
127	157	2026-02-27T13:47:45-03:00	Plano 1	open	100	10	10	10	t	t	t	t	t	t	t	2026-02-22 16:48:00+00	2026-02-22 16:48:00+00	
128	158	2026-03-01T18:13:42-03:00	Plano 1	open	100	10	10	10	t	t	t	t	t	t	t	2026-02-24 21:14:00+00	2026-02-24 21:14:00+00	
\.


--
-- Data for Name: Languages; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Languages" (id, code, name, active, "createdAt", "updatedAt") FROM stdin;
1	pt-BR	Português	t	2026-02-10 02:12:00.394326+00	2026-02-10 02:12:00.394326+00
\.


--
-- Data for Name: LogTickets; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."LogTickets" (id, "userId", "ticketId", "queueId", type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MediaFiles; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."MediaFiles" (id, folder_id, company_id, original_name, custom_name, mime_type, size, storage_path, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: MediaFolders; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."MediaFolders" (id, name, description, company_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Messages" (body, ack, read, "mediaType", "mediaUrl", "ticketId", "createdAt", "updatedAt", "fromMe", "isDeleted", "contactId", "companyId", "remoteJid", "dataJson", participant, "queueId", "ticketTrakingId", "quotedMsgId", wid, id, "isPrivate", "isEdited", "isForwarded", "fromAgent", "userId") FROM stdin;
\.


--
-- Data for Name: MobileWebhooks; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."MobileWebhooks" (id, "userId", "companyId", "webhookUrl", "deviceToken", platform, "isActive", "failureCount", "lastUsed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Negocios; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Negocios" (id, "companyId", name, description, "kanbanBoards", users, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Partners; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Partners" (id, name, phone, email, document, commission, "typeCommission", "walletId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Plans; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Plans" (id, name, users, connections, queues, "createdAt", "updatedAt", amount, "useFacebook", "useInstagram", "useWhatsapp", "useCampaigns", "useExternalApi", "useInternalChat", "useSchedules", "useKanban", "isPublic", recurrence, trial, "trialDays", "useIntegrations", "useOpenAi", "affiliateCommissionRate") FROM stdin;
1	Plano 1	10	10	10	2026-02-09 01:20:03.848693+00	2026-02-09 01:25:56.104+00	100	t	t	t	t	t	t	t	t	t	MENSAL	f	0	t	t	\N
\.


--
-- Data for Name: ProdutoCategorias; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ProdutoCategorias" (id, "companyId", nome, slug, descricao, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProdutoVariacaoGrupos; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ProdutoVariacaoGrupos" (id, "companyId", nome, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProdutoVariacaoItens; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ProdutoVariacaoItens" (id, "produtoId", "opcaoId", "valorOverride", "estoqueOverride", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProdutoVariacaoOpcoes; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ProdutoVariacaoOpcoes" (id, "grupoId", nome, ordem, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Produtos; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Produtos" (id, "companyId", tipo, nome, descricao, valor, status, imagem_principal, galeria, dados_especificos, "createdAt", "updatedAt", "categoriaId", "controleEstoque", "estoqueAtual", "estoqueMinimo") FROM stdin;
15	\N	servico	Teste de PRODUTO		90.00	disponivel	\N	\N	\N	2025-12-08 21:15:27.61	2025-12-08 21:15:27.61	\N	f	0	0
16	\N	imovel	APTO 270MIL - CANCUN	VENDA | R$ 270 MIL | Apartamento 03 quartos, com 78,00 m² no Bairro Água Verde em Blumenau-SC\n\n- 3 dormitórios\n- Sala de estar\n- Sala de jantar\n- Cozinha\n- Banheiro\n- Área de serviço\n- Sacada com churrasqueira\n- 1 vaga de garagem coberta\n\n🎯 Johann Ohf, 1445\n📸 FOTOS: jpeixer.com.br/imovel/7247	270000.00	disponivel	company59/produtos/POST_-_APTO_270MIL_-_4.png	\N	\N	2025-12-09 08:18:58.824	2025-12-09 08:18:58.824	\N	f	0	0
8	\N	fisico	Monitor		150.00	disponivel	company44/produtos/Captura_de_tela_13-11-2025_145921_www.mercadolivre.com.br.jpeg	["company44/produtos/51vJqQDLzWL.jpg", "company44/produtos/garnet2.jpg"]	\N	2025-11-26 13:42:04.88	2025-11-26 13:42:04.88	\N	f	0	0
4	\N	fisico	teste		325.00	disponivel	\N	\N	\N	2025-11-16 13:16:01.361	2025-11-16 13:16:01.361	\N	f	0	0
12	\N	veiculo	Gol G7	📍 2019 / 1.6 MSI\n⛽ Flex\n📌 Completo	56000.00	disponivel	company46/produtos/sddefault.jpg	["company46/produtos/gol-g7-e-g8-painel.jpg", "company46/produtos/hqdefault.jpg"]	\N	2025-11-27 00:22:49.902	2025-11-27 01:01:59.533	\N	f	0	0
13	\N	veiculo	Honda HR-V	📍 2017 / EXL\n⛽ Flex\n🛠 Automático	98000.00	disponivel	company46/produtos/honda-hr-v-touring-vs.-vw-t-cross-highline-vs.-jeep-renegade-s.jpg	["company46/produtos/Honda-HR-V-test-drive_(7).jpg", "company46/produtos/HRV23-038_EXLNavi_USB-A_Version-cropped.jpg"]	\N	2025-11-27 00:23:28.549	2025-11-27 01:02:08.776	\N	f	0	0
14	\N	veiculo	Volkswagen Jetta	📍 2015 / Highline 2.0 TSI\n🛠 Automático\n⚡ Turbo	79900.00	disponivel	company46/produtos/a1m9_1VI9i424Wi.jpg	["company46/produtos/Jetta-2019-R-line-frente34l.jpg", "company46/produtos/Jetta-GLI-19.png"]	\N	2025-11-27 00:24:08.33	2025-11-27 01:02:29.991	\N	f	0	0
18	\N	servico	Limpeza		200.00	disponivel	company108/produtos/valornovo.png	["company108/produtos/print-fluxo.png", "company108/produtos/print-fluxo_(1).webp", "company108/produtos/print-fluxo.webp"]	\N	2026-01-25 00:57:48.317	2026-01-25 00:57:48.317	\N	f	0	0
20	\N	fisico	123	123	123.00	disponivel	company132/produtos/image-1-1500x999-1.jpeg	["company132/produtos/image-1-1500x999-1.jpeg", "company132/produtos/MicrosoftTeams-image-45-1-150x150.png"]	\N	2026-02-03 02:23:51.857	2026-02-03 02:23:51.857	\N	f	0	0
\.


--
-- Data for Name: PromptToolSettings; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."PromptToolSettings" (id, "companyId", "promptId", "toolName", enabled, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Prompts; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Prompts" (id, name, "apiKey", prompt, "maxTokens", "maxMessages", temperature, "promptTokens", "completionTokens", "totalTokens", voice, "voiceKey", "voiceRegion", "queueId", "companyId", "createdAt", "updatedAt", model, provider, "knowledgeBase") FROM stdin;
\.


--
-- Data for Name: QueueIntegrations; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."QueueIntegrations" (id, type, name, "projectName", "jsonContent", language, "createdAt", "updatedAt", "urlN8N", "companyId", "typebotExpires", "typebotKeywordFinish", "typebotUnknownMessage", "typebotSlug", "typebotDelayMessage", "typebotKeywordRestart", "typebotRestartMessage") FROM stdin;
2	webhook	Douglas7702	Douglas7702			2025-10-28 21:36:28.51+00	2025-10-28 21:36:28.51+00	https://run-time.botbusiness.net/gupshup/bf9cca9c-df8a-41f9-8570-82ced4f79dd4	\N	0				1000		
5	flowbuilder	Fluxo	Fluxo			2025-12-17 18:01:32.892+00	2025-12-17 18:01:32.892+00		1	0				1000		
4	webhook	tgd	tgd			2025-12-12 18:53:28.013+00	2025-12-12 18:53:28.013+00	fsgsdfgsdf	\N	0				1000		
6	flowbuilder	teste	teste			2026-01-07 19:54:15.318+00	2026-01-07 19:54:53.157+00		\N	0				1000		
\.


--
-- Data for Name: QueueOptions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."QueueOptions" (id, title, message, option, "queueId", "parentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Queues; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Queues" (id, name, color, "greetingMessage", "createdAt", "updatedAt", "companyId", schedules, "outOfHoursMessage", "orderQueue", "tempoRoteador", "ativarRoteador", "integrationId", "fileListId", "closeTicket") FROM stdin;
\.


--
-- Data for Name: QuickMessages; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."QuickMessages" (id, shortcode, message, "companyId", "createdAt", "updatedAt", "userId", "mediaPath", "mediaName", geral, visao) FROM stdin;
\.


--
-- Data for Name: ScheduledMessages; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ScheduledMessages" (id, data_mensagem_programada, id_conexao, intervalo, valor_intervalo, mensagem, tipo_dias_envio, mostrar_usuario_mensagem, criar_ticket, contatos, tags, "companyId", nome, "createdAt", "updatedAt", "mediaPath", "mediaName", tipo_arquivo, usuario_envio, enviar_quantas_vezes) FROM stdin;
\.


--
-- Data for Name: ScheduledMessagesEnvios; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."ScheduledMessagesEnvios" (id, "createdAt", "updatedAt", "mediaPath", "mediaName", mensagem, "companyId", data_envio, scheduledmessages, key) FROM stdin;
\.


--
-- Data for Name: Schedules; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Schedules" (id, body, "sendAt", "sentAt", "contactId", "ticketId", "userId", "companyId", "createdAt", "updatedAt", status, "ticketUserId", "whatsappId", "statusTicket", "queueId", "openTicket", "mediaName", "mediaPath", intervalo, "valorIntervalo", "enviarQuantasVezes", "tipoDias", "contadorEnvio", assinar, "googleEventId") FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."SequelizeMeta" (name) FROM stdin;
20200717133438-create-users.js
20200717144403-create-contacts.js
20200717145643-create-tickets.js
20200717151645-create-messages.js
20200717170223-create-whatsapps.js
20200723200315-create-contacts-custom-fields.js
20200723202116-add-email-field-to-contacts.js
20200730153237-remove-user-association-from-messages.js
20200730153545-add-fromMe-to-messages.js
20200813114236-change-ticket-lastMessage-column-type.js
20200901235509-add-profile-column-to-users.js
20200903215941-create-settings.js
20200904220257-add-name-to-whatsapp.js
20200906122228-add-name-default-field-to-whatsapp.js
20200906155658-add-whatsapp-field-to-tickets.js
20200919124112-update-default-column-name-on-whatsappp.js
20200927220708-add-isDeleted-column-to-messages.js
20200929145451-add-user-tokenVersion-column.js
20200930162323-add-isGroup-column-to-tickets.js
20200930194808-add-isGroup-column-to-contacts.js
20201004150008-add-contactId-column-to-messages.js
20201004155719-add-vcardContactId-column-to-messages.js
20201004955719-remove-vcardContactId-column-to-messages.js
20201026215410-add-retries-to-whatsapps.js
20201028124427-add-quoted-msg-to-messages.js
20210108001431-add-unreadMessages-to-tickets.js
20210108164404-create-queues.js
20210108164504-add-queueId-to-tickets.js
20210108174594-associate-whatsapp-queue.js
20210108204708-associate-users-queue.js
20210109192513-add-greetingMessage-to-whatsapp.js
20210109192514-create-companies-table.js
20210109192515-add-column-companyId-to-Settings-table.js
20210109192516-add-column-companyId-to-Users-table.js
20210109192517-add-column-companyId-to-Contacts-table.js
20210109192518-add-column-companyId-to-Messages-table.js
20210109192519-add-column-companyId-to-Queues-table.js
20210109192520-add-column-companyId-to-Whatsapps-table.js
20210109192521-add-column-companyId-to-Tickets-table.js
20210109192522-create-plans-table.js
20210109192523-add-column-amount-to-Plan.js
20210109192523-add-column-planId-to-Companies.js
20210109192523-add-column-status-and-schedules-to-Companies.js
20210109192523-create-ticket-notes.js
20210109192524-create-quick-messages.js
20210109192525-add-column-complationMessage-to-whatsapp.js
20210109192526-add-column-outOfHoursMessage-to-whatsapp .js
20210109192527-add-column-super-to-Users-table.js
20210109192528-change-column-message-to-quick-messages-table.js
20210109192529-create-helps.js
20210109192531-create-TicketTracking-table.js
20210109192532-add-column-online-to-Users-table.js
20210109192533-create-UserRatings-table.js
20210109192534-add-rated-to-TicketTraking.js
20210109192536-add-unique-constraint-to-Tickets-table.js
20210818102606-add-uuid-to-tickets.js
20210818102607-remove-unique-indexes-to-Queues-table.js
20210818102608-add-unique-indexes-to-Queues-table.js
20210818102609-add-token-to-Whatsapps.js
20211017014719-create-chatbots.js
20211017014721-create-dialog-chatbot.js
20211205164404-create-queue-options.js
20211212125704-add-chatbot-to-tickets.js
20211227010200-create-schedules.js
20212016014719-add-bot-ticket.js
20212016014719-add-queueId-dialog.js
20220115114088-add-column-userId-to-QuickMessages-table.js
20220117130000-create-tags.js
20220117134400-associate-tickets-tags.js
20220122160900-add-status-to-schedules.js
20220220014719-add-farewellMessage-to-whatsapp.js
20220221014717-add-provider-whatsapp.js
20220221014718-add-remoteJid-messages.js
20220221014719-add-jsonMessage-messages.js
20220221014720-add-participant-messages.js
20220221014721-create-baileys.js
20220315110000-create-ContactLists-table.js
20220315110001-create-ContactListItems-table.js
20220315110002-create-Campaigns-table.js
20220315110004-create-CampaignSettings-table.js
20220315110005-remove-constraint-to-Settings.js
20220321130000-create-CampaignShipping.js
20220404000000-add-column-queueId-to-Messages-table.js
20220406000000-add-column-dueDate-to-Companies.js
20220406000001-add-column-recurrence-to-Companies.js
20220411000000-add-column-startTime-and-endTime-to-Queues.js
20220411000001-remove-column-startTime-and-endTime-to-Queues.js
20220411000002-add-column-schedules-and-outOfHoursMessage-to-Queues.js
20220411000003-create-table-Announcements.js
20220425000000-create-table-Chats.js
20220425000001-create-table-ChatUsers.js
20220425000002-create-table-ChatMessages.js
20220512000001-create-Indexes.js
20220723000001-add-mediaPath-to-quickmessages.js
20220723000002-add-mediaName-to-quickemessages.js
20220723000003-add-geral-to-quickmessages.js
20221123155118-add-acceptAudioMessages-to-contact.js
20221227164300-add-colunms-document-and-paymentMethod-to-companies-table.js
20221229000000-add-column-number-to-Whatsapps.js
20222016014719-add-channel-session.js
20222016014719-add-channel-to-contacts.js
20222016014719-add-channel-to-ticket.js
20222016014719-add-channel-token.js
20222016014719-add-channel-tokenUser.js
20222016014719-add-facebookPageUserId-whatsapp.js
20222016014719-add-facebookUserId-whatsapp.js
20222016014719-add-isAgent-chatbot.js
20230105164900-add-useFacebook-Plans.js
20230105164900-add-useInstagram-Plans.js
20230105164900-add-useWhatsapp-Plans.js
20230106164900-add-useCampaigns-Plans.js
20230106164900-add-useExternalApi-Plans.js
20230106164900-add-useInternalChat-Plans.js
20230106164900-add-useSchedules-Plans.js
20230110072000-create-integrations.js
20230119000002-create-subscriptions.js
20230119000003-create-invoices.js
20230120000000-create-ApiUsage.js
20230123155600-add-colunms-lastLogin-to-companies-table.js
20230124110200-add-endWork-Users.js
20230124110200-add-startWork-Users.js
20230127091500-add-column-active-to-Contacts.js
20230216173900-add-uuid-extension.js
20230301110200-add-color-Users.js
20230301110201-add-farewellMessage-Users.js
20230303223000-add-maxUseBotQueues-to-whatsapp copy.js
20230303223001-add-amountUsedBotQueues-to-tickets.js
20230403193000-add-disable-bot-column-to-contacts.js
20230403193000-add-expiresTicket-fields-to-whatsapp.js
20230411131007-add-allowGroup-whatsapp.js
20230505221007-add-closedAt-TicketTraking.js
20230517221007-add-optQueueId-Chatbots.js
20230517221007-add-optUserId-chatbots.js
20230517221007-add-queueType-Chatbots.js
20230603212335-create-QueueIntegrations.js
20230603212337-add-QueueIntegrations-integrationId-Chatbots.js
20230603212337-add-urlN8N-QueueIntegrations.js
20230612221007-add-remoteJid-Contact.js
20230623095932-add-whatsapp-to-user.js
20230623113000-add-timeUseBotQueues-to-whatsapp.js
20230623133903-add-chatbotAt-ticket-tracking.js
20230626141100-add-column-ticketTrakingId-to-Messages-table.js
20230628134807-add-orderQueue-Queue.js
20230630150600-create-associate-contacttags.js
20230703221100-add-column-queueId-to-TicketTraking-table.js
20230704124428-update-messages.js
20230707221100-add-column-isPrivate-to-Message-table.js
20230708192530-add-unique-constraint-to-Contacts-table.js
20230711080001-create-Index-Message-wid.js
20230711094417-add-column-companyId-to-QueueIntegrations-table.js
20230711111700-add-timeSendQueue-to-whatsapp.js
20230711111701-add-sendIdQueue-to-whatsapp.js
20230713131510-add-tempoRoteador-Queue.js
20230714113901-create-Files.js
20230714113902-create-fileOptions.js
20230716229907-add-ativaRoteador-Queue.js
20230717113705-add-isEdited-to-messages.js
20230717221007-add-optFileId-chatbots.js
20230723301001-add-kanban-to-Tags.js
20230724111007-add-collumns-whatsapp.js
20230724192535-add-column-ratingMessage-to-whatsapp.js
20230726203900-add-allTickets-user.js
20230731214345-create-table-webhooks.js
20230731224345-add-active-table-webhooks.js
20230731331007-add-lgpdAccept-Contact.js
20230808141907-add-collumns-Users.js
20230809081007-add-import-old-messages-to-whatsapp.js
20230809081007-add-import-recent-messages-to-whatsapp.js
20230809081008-add-status-import-to-whatsapp.js
20230809081009-add-closed-tickets-post-imported-to-whatsapp.js
20230809081010-add-import-old-messages-groups-to-whatsapp.js
20230809081011-add-imported-to-tickets.js
20230809081012-change-name-unique-false-to-whatsapp.js
20230810224345-add-company-table-webhooks.js
20230810234345-add-company-table-flowbuilder.js
20230813114236-change-ticket-lastMessage-column-type.js
20230816212401-add-timeCreateNewTicket-to-whatsapp.js
20230823082607-add-urlPicture-Contact.js
20230823114236-add-column-flow-and-location.js
20230823124236-add-column-data.js
20230823134236-add-column-hashflow.js
20230824082607-add-mediaType-FilesOptions.js
20230824134719-add-greetingMediaAtachmentToWhatsapp.js
20230825080921-add-profile-image-to-user.js
20230922212337-add-integrationId-Queues.js
20230922214345-create-table-flow-default.js
20231019113637-add-columns-Campaign.js
20231220080937-add-columns-Whatsapps.js
20231220223517-add-column-whatsappId-to-Contacts.js
20231221080937-change-collectiveVacationMessage-Whatsapps.js
20231229214537-add-defaultTicketsManagerWidth-Users.js
20232010133900-create-Partners-table.js
20240102230240-create-ScheduledMessages.js
20240102230240-create-ScheduledMessagesEnvio.js
20240102230241-create-ContactGroup.js
20240111080937-change-profilePicUrl-contacts.js
20240125080937-change-urlPicture-contacts.js
20240212113637-add-recorrencia-Schedules.js
20240311125600-add-colunms-folderSize-to-companies-table.js
20240322143411-add-queueIdImportMessage-to-whatsapps.js
20240323220001-create-companyId-Index-Message.js
20230801081907-add-collumns-Ticket.js
20230802214345-create-table-flowbuilder.js
20230828143411-add-Integrations-to-tickets.js
20230828143411-add-isOutOfHour-to-tickets.js
20230828144000-create-prompts.js
20230828144100-add-column-promptid-into-whatsapps.js
20230829214345-create-table-imgs-flow.js
20230831093000-add-useKanban-Plans.js
20230901101300-create-CompaniesSettings.js
20230901214345-create-table-audios-flow.js
20230902082607-add-pictureUpdate-Contact.js
20230904214345-create-table-campaign-flow.js
20230905114236-add-column-flow-now.js
20230911113900-add-unaccent-extension.js
20230911143705-add-isForwarded-to-messages.js
20230912112028-insert-CompanieSettings.js
20230913210007-create-table-LogTickets.js
20230915212800-add-public-to-plans.js
20230923000001-create-Indexes-new.js
20230923124428-update-tickets.js
20230924212337-add-fileListId-Queues.js
20230925112401-create-Indexes Tickets.js
20231128123537-add-typebot-QueueIntegrations.js
20231201123411-add-closeTicketOnTransfer-to-CompaniesSettings.js
20231202143411-add-typebotSessionId-to-tickets.js
20231207080337-add-typebotDelayMessage-QueueIntegrations.js
20231207085011-add-typebotStatus-to-tickets.js
20231218160937-add-columns-QueueIntegrations.js
20230807081007-add-lgpdAccept-Ticket.js
20230808135401-add-groupAsTicket-to-whatsapp.js
20230925212337-add-closeTicket-Queues-Chatbots.js
20230926143705-add-isGroup-to-ContactListItems.js
20231008145702-add-column-schedules-to-Whatsapps.js
20231016214537-add-allHistoric-users.js
20240202110037-add-collumns-custommessages-settings.js
20240206110037-add-linkInvoice-to-Invoices.js
20231019113637-add-columns-Schedules.js
20231020125000-add-columns-Plans.js
20231103230445-change-collumn-expiresInactiveMessage.js
20231105221305-add-visao-to-quickMessages.js
20231110214537-add-allUserChat-users.js
20231111185822-add_reset_password_column.js
20231114113637-add-openTicket-Campaign.js
20231114113637-add-openTicket-Schedules.js
20231117000001-add-mediaName-to-schedules.js
20231117000001-add-mediaPath-to-schedules.js
20231121143411-add-isActiveDemand-to-tickets.js
20231122193355-create-table-wallets-contact.js
20231122223411-add-DirectTicketsToWallets-to-CompaniesSettings.js
20231127113000-add-columns-Plans.js
20231213214537-add-permissions-users.js
20240308133648-add-columns-to-Tags.js
20240308133648-add-rollbackLaneId-to-Tags.js
20240422214537-add-permissions-users.js
20240425223411-add-showNotificationPending-to-CompaniesSettings.js
20240425225011-add-typebotSsessionTime-to-tickets.js
20240515221400-create-Versions.js
20240516112028-insert-version.js
20240523083535-create-index.js
20240610083535-create-index.js
20240718030548-add-column-flowIdNotPhrase-to-whatsapp.js
20240718084127-recriate-constraint-integracoes.js
20240719130841-add-column-flowIdWelcome-to-whatsapp.js
20240719174849-add-column-whatsappId-to-flowCampaigns.js
20240924171945-add-variables-column-to-flowbuilders.js
20250124140438-add-wavoip-to-whatsapp.js
20250127132448-add-column-notificameHub-to-CompaniesSettings-table.js
20250127171400-change_message_id_type_from_Messages.js
20250128161327-add-column-notificameHub-to-Whatsapps-table.js
20250914174400-add-provider-model-to-prompts.js.js
20251114003000-create-Negocios-table.js
20251215031800-add-productsSent-to-tickets.js
20241201000000-create-mobile-webhooks.js
20251119083000-create-Produtos-table.js
20251119083500-create-Ferramentas-table.js
20251123190000-create-table-google-calendar-integrations.js
20251123190500-add-column-googleEventId-to-schedules.js
20251125003000-add-extra-fields-to-contacts.js
20251125030500-create-slider-banners.js
20251126010000-create-faturas.js
20251126155000-add-lid-column-to-contacts.js
20251129000000-create-ia-workflows.js
20251203020000-add-video-url-to-tutorial-videos.js
20251204150000-create-slider-home.js
20251205160000-create-profissionais-servicos.js
20251205163000-create-prompt-tool-settings.js
20251214012800-create-automations.js
20251216090000-create-crm-leads.js
20251216090500-create-crm-clients.js
20251216092000-create-financeiro-faturas.js
20251216092500-create-financeiro-pagamentos.js
20251216093000-add-valor-pago-to-financeiro-faturas.js
20251218133500-link-leads-clients-contacts.js
20251219050000-create-media-folders.js
20251219051000-create-media-files.js
20251222170500-create-company-payment-settings.js
20251222171000-add-payment-fields-financeiro-faturas.js
20251222171500-add-asaas-customer-id-to-crm-clients.js
20251222172000-add-checkout-token-to-financeiro-faturas.js
20251223100000-create-company-integration-settings.js
20251223100500-create-company-integration-field-maps.js
20251223103000-create-company-api-keys.js
20251224130000-fix-company-payment-settings-columns.js
20251224170000-create-scheduled-dispatchers.js
20251224170500-create-scheduled-dispatch-logs.js
20251229210000-add-lead-value-to-tickets.js
20251231230000-create-projects-table.js
20251231230100-create-project-services-table.js
20251231230200-create-project-products-table.js
20251231230300-create-project-users-table.js
20251231230400-create-project-tasks-table.js
20251231230500-create-project-task-users-table.js
20260101150000-add-project-id-to-financeiro-faturas.js
20260101160000-create-schedules.js
20260101160100-create-appointments.js
20260101173000-add-professional-fields-to-users.js
20260101173100-create-user-services.js
20260106193000-add-knowledgeBase-to-prompts.js
20260108195000-add-column-phrases-to-flowcampaigns.js
20260108195500-add-column-matchType-to-flowcampaigns.js
20260109215800-add-fromAgent-to-messages.js
20260109223800-add-userId-to-messages.js
20260110223300-add-lid-to-tickets.js
20260130100000-add-loading-image-to-companies
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Settings" (key, value, "createdAt", "updatedAt", "companyId", id) FROM stdin;
userCreation	enabled	2025-10-10 02:50:00.272+00	2025-10-10 02:50:00.272+00	\N	1
hoursCloseTicketsAuto	9999999999	2025-10-10 02:50:00.274+00	2025-10-10 02:50:00.274+00	1	2
chatBotType	text	2025-10-10 02:50:00.276+00	2025-10-10 02:50:00.276+00	1	3
acceptCallWhatsapp	enabled	2025-10-10 02:50:00.278+00	2025-10-10 02:50:00.278+00	1	4
userRandom	enabled	2025-10-10 02:50:00.28+00	2025-10-10 02:50:00.28+00	1	5
sendGreetingMessageOneQueues	enabled	2025-10-10 02:50:00.282+00	2025-10-10 02:50:00.282+00	1	6
sendSignMessage	enabled	2025-10-10 02:50:00.284+00	2025-10-10 02:50:00.284+00	1	7
sendFarewellWaitingTicket	disabled	2025-10-10 02:50:00.288+00	2025-10-10 02:50:00.288+00	1	8
userRating	disabled	2025-10-10 02:50:00.29+00	2025-10-10 02:50:00.29+00	1	9
sendGreetingAccepted	enabled	2025-10-10 02:50:00.291+00	2025-10-10 02:50:00.291+00	1	10
CheckMsgIsGroup	enabled	2025-10-10 02:50:00.293+00	2025-10-10 02:50:00.293+00	1	11
sendQueuePosition	enabled	2025-10-10 02:50:00.294+00	2025-10-10 02:50:00.294+00	1	12
scheduleType	disabled	2025-10-10 02:50:00.296+00	2025-10-10 02:50:00.296+00	1	13
acceptAudioMessageContact	enabled	2025-10-10 02:50:00.297+00	2025-10-10 02:50:00.297+00	1	14
enableLGPD	disabled	2025-10-10 02:50:00.299+00	2025-10-10 02:50:00.299+00	1	15
requiredTag	disabled	2025-10-10 02:50:00.3+00	2025-10-10 02:50:00.3+00	1	16
wtV	disabled	2025-10-10 02:50:00.303+00	2025-10-10 02:50:00.303+00	\N	18
asaas		2025-10-10 02:50:00.342+00	2025-10-10 02:50:00.342+00	1	19
efichavepix		2025-10-10 02:50:00.342+00	2025-10-10 02:50:00.342+00	1	20
eficlientid		2025-10-10 02:50:00.342+00	2025-10-10 02:50:00.342+00	1	21
eficlientsecret		2025-10-10 02:50:00.342+00	2025-10-10 02:50:00.342+00	1	22
mpaccesstoken		2025-10-10 02:50:00.342+00	2025-10-10 02:50:00.342+00	1	23
stripeprivatekey		2025-10-10 02:50:00.342+00	2025-10-10 02:50:00.342+00	1	24
asaastoken		2025-10-10 02:50:00.342+00	2025-10-10 02:50:00.342+00	1	25
downloadLimit	2048	2025-10-10 02:50:00.302+00	2025-10-11 05:07:50.687+00	1	17
userCreation	enabled	2025-10-11 05:07:54.188+00	2025-10-11 05:07:54.188+00	1	31
backendUrl	https://api.faedeveloper.com.br	2026-01-13 05:52:38.638+00	2026-01-13 05:52:38.638+00	1	57
frontendUrl	https://app.faedeveloper.com.br	2026-01-13 05:52:49.348+00	2026-01-13 05:52:49.348+00	1	58
openaikeyaudio		2025-10-10 02:50:00.342+00	2025-12-27 19:05:44.374+00	1	26
termsImage		2026-01-09 20:37:29.673+00	2026-01-09 20:55:54.917+00	1	39
dashboardImage3		2026-01-26 07:01:13.025+00	2026-01-26 07:27:40.244+00	1	81
dashboardImage2		2026-01-26 07:01:07.247+00	2026-01-26 07:27:41.618+00	1	80
dashboardImage1		2026-01-26 07:01:02.159+00	2026-01-26 07:31:03.886+00	1	79
termsText		2026-01-09 20:24:45.712+00	2026-02-09 00:57:21.624+00	1	38
trialDays	5	2026-01-09 21:49:19.965+00	2026-02-09 00:57:24.017+00	1	40
welcomeEmailText		2026-01-09 21:49:20.849+00	2026-02-09 00:57:26.178+00	1	41
smtpHost		2026-01-09 21:49:34.816+00	2026-02-09 00:57:30.924+00	1	44
smtpPort		2026-01-09 22:13:39.735+00	2026-02-09 00:57:31.949+00	1	48
smtpFrom		2026-01-09 21:49:33.404+00	2026-02-09 00:57:32.912+00	1	43
smtpPass		2026-01-09 21:49:38.364+00	2026-02-09 00:57:33.881+00	1	46
smtpUser		2026-01-09 21:49:36.109+00	2026-02-09 00:57:35.367+00	1	45
openaiApiKey		2026-01-13 05:45:27.749+00	2026-02-09 00:57:36.292+00	1	52
geminiApiKey		2026-01-13 05:45:29.982+00	2026-02-09 00:57:38.203+00	1	53
verifyToken		2026-01-13 05:52:13.47+00	2026-02-09 00:57:39.187+00	1	56
facebookAppId		2026-01-13 05:51:50.179+00	2026-02-09 00:57:40.371+00	1	54
facebookAppSecret		2026-01-13 05:52:01.032+00	2026-02-09 00:57:42.363+00	1	55
googleClientId		2026-01-13 05:53:06.729+00	2026-02-09 00:57:43.64+00	1	59
googleClientSecret		2026-01-13 05:53:20.664+00	2026-02-09 00:57:44.614+00	1	60
googleRedirectUri		2026-01-13 05:53:29.911+00	2026-02-09 00:57:45.403+00	1	61
appLogoLight	logolp.png	2025-10-10 03:39:23.927+00	2026-02-21 18:25:49.807+00	1	29
appLogoFavicon	whatsapp.png	2025-10-10 03:39:27.943+00	2026-02-21 18:26:05.402+00	1	30
appName	Atend Zappy	2025-10-10 03:39:16.401+00	2026-02-21 18:26:12.792+00	1	28
appLogoLoading	nopicture.png	2026-01-30 13:37:23.913+00	2026-02-21 18:26:28.099+00	1	85
primaryColorLight	#1E1F20	2025-10-10 03:39:07.034+00	2026-02-06 08:42:44.909+00	1	27
welcomeWhatsappText		2026-01-09 21:49:31.841+00	2026-02-09 00:57:28.691+00	1	42
campaignsEnabled	true	2026-02-21 16:28:47.984+00	2026-02-21 16:28:47.984+00	156	109
campaignsEnabled	true	2026-02-22 16:47:48.349+00	2026-02-22 16:47:48.349+00	157	110
campaignsEnabled	true	2026-02-24 21:13:44.557+00	2026-02-24 21:13:44.557+00	158	111
\.


--
-- Data for Name: SliderBanners; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."SliderBanners" (id, image, url, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Subscriptions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Subscriptions" (id, "isActive", "expiresAt", "userPriceCents", "whatsPriceCents", "lastInvoiceUrl", "lastPlanChange", "companyId", "providerSubscriptionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Tags; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Tags" (id, name, color, "companyId", "createdAt", "updatedAt", kanban, "timeLane", "nextLaneId", "greetingMessageLane", "rollbackLaneId") FROM stdin;
\.


--
-- Data for Name: TicketNotes; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."TicketNotes" (id, note, "userId", "contactId", "ticketId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TicketTags; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."TicketTags" ("ticketId", "tagId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TicketTraking; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."TicketTraking" (id, "ticketId", "companyId", "whatsappId", "userId", "createdAt", "updatedAt", "queuedAt", "startedAt", "finishedAt", "ratingAt", rated, "closedAt", "chatbotAt", "queueId") FROM stdin;
\.


--
-- Data for Name: Tickets; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Tickets" (id, status, "lastMessage", "contactId", "userId", "createdAt", "updatedAt", "whatsappId", "isGroup", "unreadMessages", "queueId", "companyId", uuid, chatbot, "queueOptionId", "isBot", channel, "amountUsedBotQueues", "fromMe", "amountUsedBotQueuesNPS", "sendInactiveMessage", "lgpdSendMessageAt", "lgpdAcceptedAt", imported, "flowWebhook", "lastFlowId", "dataWebhook", "hashFlowId", "useIntegration", "integrationId", "isOutOfHour", "flowStopped", "isActiveDemand", "typebotSessionId", "typebotStatus", "typebotSessionTime", "productsSent", crm_lead_id, crm_client_id, "leadValue", lid, "waitingQuestion", "questionNodeId", "questionOptions", "timeoutEnabled", "timeoutAt") FROM stdin;
\.


--
-- Data for Name: Translations; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Translations" (id, "languageCode", key, value, "createdAt", "updatedAt") FROM stdin;
1	pt-BR	signup.title	Criar conta	2026-02-10 02:26:49.223+00	2026-02-10 02:26:49.223+00
\.


--
-- Data for Name: UserDevices; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."UserDevices" (id, "userId", "deviceToken", platform, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserGoogleCalendarIntegrations; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."UserGoogleCalendarIntegrations" (id, user_id, company_id, "googleUserId", email, "accessToken", "refreshToken", "expiryDate", "calendarId", active, "syncToken", "lastSyncAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserPagePermissions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."UserPagePermissions" (id, "userId", "pagePath", "canAccess", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserQueues; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."UserQueues" ("userId", "queueId", "createdAt", "updatedAt") FROM stdin;
7	2	2025-10-10 18:08:21.554+00	2025-10-10 18:08:21.554+00
7	3	2025-10-10 18:08:21.554+00	2025-10-10 18:08:21.554+00
8	2	2025-10-10 18:09:27.582+00	2025-10-10 18:09:27.582+00
8	3	2025-10-10 18:09:27.582+00	2025-10-10 18:09:27.582+00
20	4	2025-10-21 18:31:35.011+00	2025-10-21 18:31:35.011+00
25	7	2025-11-16 16:21:54.208+00	2025-11-16 16:21:54.208+00
27	8	2025-11-19 22:35:26.759+00	2025-11-19 22:35:26.759+00
40	10	2025-11-23 22:51:07.696+00	2025-11-23 22:51:07.696+00
44	5	2025-11-25 16:52:03.347+00	2025-11-25 16:52:03.347+00
44	6	2025-11-25 16:52:03.347+00	2025-11-25 16:52:03.347+00
43	12	2025-11-25 16:54:02.626+00	2025-11-25 16:54:02.626+00
46	13	2025-11-26 20:04:45.429+00	2025-11-26 20:04:45.429+00
46	14	2025-11-26 20:04:45.429+00	2025-11-26 20:04:45.429+00
46	15	2025-11-26 20:04:45.429+00	2025-11-26 20:04:45.429+00
46	16	2025-11-26 20:04:45.429+00	2025-11-26 20:04:45.429+00
65	17	2025-12-08 23:25:58.771+00	2025-12-08 23:25:58.771+00
59	18	2025-12-09 11:16:50.666+00	2025-12-09 11:16:50.666+00
96	26	2026-01-10 01:15:24.657+00	2026-01-10 01:15:24.657+00
103	30	2026-01-11 22:27:44.089+00	2026-01-11 22:27:44.089+00
103	31	2026-01-11 22:27:44.089+00	2026-01-11 22:27:44.089+00
103	32	2026-01-11 22:27:44.089+00	2026-01-11 22:27:44.089+00
104	33	2026-01-14 17:07:03.815+00	2026-01-14 17:07:03.815+00
104	34	2026-01-14 17:07:03.815+00	2026-01-14 17:07:03.815+00
53	35	2026-01-22 20:13:25.449+00	2026-01-22 20:13:25.449+00
110	37	2026-01-24 17:03:55.539+00	2026-01-24 17:03:55.539+00
112	39	2026-01-25 01:51:44.194+00	2026-01-25 01:51:44.194+00
112	40	2026-01-25 01:51:44.194+00	2026-01-25 01:51:44.194+00
109	42	2026-01-25 02:28:25.788+00	2026-01-25 02:28:25.788+00
114	42	2026-01-25 03:28:46.554+00	2026-01-25 03:28:46.554+00
115	43	2026-01-25 14:16:44.381+00	2026-01-25 14:16:44.381+00
113	43	2026-01-25 14:37:05.593+00	2026-01-25 14:37:05.593+00
129	47	2026-02-02 11:16:49.834+00	2026-02-02 11:16:49.834+00
130	46	2026-02-02 11:18:31.661+00	2026-02-02 11:18:31.661+00
136	51	2026-02-04 02:16:36.721+00	2026-02-04 02:16:36.721+00
136	52	2026-02-04 02:16:36.721+00	2026-02-04 02:16:36.721+00
142	54	2026-02-06 12:05:17.811+00	2026-02-06 12:05:17.811+00
5	55	2026-02-21 14:14:36.295+00	2026-02-21 14:14:36.295+00
6	55	2026-02-21 14:16:35.401+00	2026-02-21 14:16:35.401+00
5	56	2026-02-21 14:17:05.328+00	2026-02-21 14:17:05.328+00
\.


--
-- Data for Name: UserRatings; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."UserRatings" (id, "ticketId", "companyId", "userId", rate, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserServices; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."UserServices" (id, "userId", "serviceId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Users" (id, name, email, "passwordHash", "createdAt", "updatedAt", profile, "tokenVersion", "companyId", super, online, "endWork", "startWork", color, "farewellMessage", "whatsappId", "allTicket", "allowGroup", "defaultMenu", "defaultTheme", "profileImage", "allHistoric", "allUserChat", "resetPassword", "userClosePendingTicket", "showDashboard", "defaultTicketsManagerWidth", "allowRealTime", "allowConnections", "userType", "workDays", "lunchStart", "lunchEnd", "twoFactorSecret", "twoFactorEnabled", "pagePermissionsMode") FROM stdin;
9	teste	teste3@teste3.com	$2a$08$LpryaA3EubwoYk5LANp6zODnq8HpxRHruRyD7ckEpBZ5Wrtayk9Gm	2026-02-24 21:13:44.513+00	2026-02-25 00:02:10.461+00	admin	0	158	f	f	23:59	00:00			\N	disable	f	closed	light	\N	disabled	disabled	\N	enabled	disabled	550	disable	disable	admin	1,2,3,4,5	\N	\N	\N	f	inherit
7	Gabriel	teste@gmail.com	$2a$08$gJ3DQ3ZjV5oCbaLepqmcZuLtcKmvpuI1HiElPOkZuwVTHYcC0i8jK	2026-02-21 16:28:47.942+00	2026-02-23 16:50:12.887+00	admin	0	156	f	f	23:59	00:00			\N	disable	f	closed	light	\N	disabled	disabled	\N	enabled	disabled	550	disable	disable	administrador	1,2,3,4,5	\N	\N	\N	f	inherit
1	Administrador	user@faedeveloper.com.br	$2a$08$fNxIeNjdfBPHnsgy8uGwZOZkx6gEiP3PIb//rccyoxgTB/SfoJCpO	2026-02-09 01:20:03.86568+00	2026-02-25 01:19:30.67+00	admin	0	1	t	t	23:59	00:00	\N	\N	\N	disable	f	closed	light	\N	disabled	disabled	\N	enabled	disabled	550	disabled	disabled	administrador	1,2,3,4,5	\N	\N	\N	f	inherit
8	Thiago	thiagocorreaoficial121212@gmail.com	$2a$08$qUQpb5GF9daFJuCP1GokmOiDP.apSgq6jHCNZNcfRVPWet4fUqFJy	2026-02-22 16:47:48.294+00	2026-02-22 23:03:32.492+00	admin	0	157	f	f	23:59	00:00			\N	disable	f	closed	light	\N	disabled	disabled	\N	enabled	disabled	550	disable	disable	administrador	1,2,3,4,5	\N	\N	\N	f	inherit
\.


--
-- Data for Name: Versions; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Versions" (id, "versionFrontend", "versionBackend", "createdAt", "updatedAt") FROM stdin;
1	1.1.7d	1.1.7d	2024-05-16 15:13:48.163+00	2024-05-16 16:02:46.03+00
\.


--
-- Data for Name: Webhooks; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Webhooks" (id, user_id, name, hash_id, config, "createdAt", "updatedAt", active, "requestMonth", "requestAll", company_id) FROM stdin;
1	104	flowbuilder	WOz3RGmE5MTd6RRyPzXTv0YO9SAjuqbzHAeNaY7f26	\N	2026-01-14 16:11:53.265+00	2026-01-14 16:11:53.265+00	t	0	0	104
2	108	flowbuilder	wgrqh5PVGD0SKgNKRyS0tG3HEqXZ4tjJhflIbUQXJH	\N	2026-01-20 19:07:26.937+00	2026-01-20 19:07:26.937+00	t	0	0	107
3	109	flowbuilder	ResJaWFq9TxVPBJFRCcZi8biM7lerVGiIJCBScZKmy	\N	2026-01-23 23:01:00.34+00	2026-01-23 23:01:00.34+00	t	0	0	108
4	110	flowbuilder	fO7c3SAHSwck0tGF4fhcM1Pf7ljITFG5T8PU9xkEDC	\N	2026-01-24 14:04:34.917+00	2026-01-24 14:04:34.917+00	t	0	0	109
5	113	flowbuilder	bbQdemyyYTFp1eqSfGyS2OAsu2dbs9IzX3WuTogJKo	\N	2026-01-25 03:01:11.169+00	2026-01-25 03:01:11.169+00	t	0	0	112
6	125	flowbuilder	p1rfhnSiZKQGu4Qe2vECzWOfy1k8bauExiUbxLiFNj	\N	2026-01-29 23:29:39.535+00	2026-01-29 23:29:39.535+00	t	0	0	122
7	127	flowbuilder	VfS6vV4yDCF41wEehufxI4ubXaPmxoyBNujVrtI6P3	\N	2026-01-30 16:58:27.421+00	2026-01-30 16:58:27.421+00	t	0	0	129
8	129	flowbuilder	zRoMRbdEC4zIgh9WLppQXTV7s6Du8PPgvzzC9BuJhb	\N	2026-02-02 03:38:13.735+00	2026-02-02 03:38:13.735+00	t	0	0	131
9	131	flowbuilder	P5Z9isyF1k3z3haFSoCocjiCCfFCx7WiS7Amj9R6qS	\N	2026-02-03 04:37:54.022+00	2026-02-03 04:37:54.022+00	t	0	0	132
10	132	flowbuilder	b9KPE5v6d7iwtzP75m9yYyfjagYlNG8pGcLMdusQAc	\N	2026-02-03 18:28:08.928+00	2026-02-03 18:28:08.928+00	t	0	0	133
11	136	flowbuilder	2HTUEA9zAxJHCxfn6hG9iilnVkK704PH1OznnHnDGU	\N	2026-02-04 01:56:32.835+00	2026-02-04 01:56:32.835+00	t	0	0	139
12	128	flowbuilder	m1UMP7ckjKC0BKNLfvAzh8nIlq0ZPOqq9CVAGXT3ef	\N	2026-02-04 03:12:03.261+00	2026-02-04 03:12:03.261+00	t	0	0	130
13	142	flowbuilder	ewq2k3UGAxdxkEcva99OchOUjvKOPuJX4mwi3wqKVo	\N	2026-02-06 12:01:57.855+00	2026-02-06 12:01:57.855+00	t	0	0	144
14	145	flowbuilder	dCqCsMnFKGTFLxicJ68w5IGttUVCzNxFqLIguhB4qc	\N	2026-02-07 13:01:42.85+00	2026-02-07 13:01:42.85+00	t	0	0	147
15	143	flowbuilder	0Ch1oB1mMcXQK6bGM0FTH8MgkB1DD55CLIAEVKnJce	\N	2026-02-07 22:50:08.417+00	2026-02-07 22:50:08.417+00	t	0	0	145
16	147	flowbuilder	CYkuF3mbmB5RKQ0fhfzerCM7UzwGSwrYAi6sFnabqX	\N	2026-02-08 18:19:53.688+00	2026-02-08 18:19:53.688+00	t	0	0	149
17	5	flowbuilder	7fd7xf5Qz9tXaYRCdpNeLAGrTBhhPzBhpljXlVpF5A	\N	2026-02-21 15:08:10.079+00	2026-02-21 15:08:10.079+00	t	0	0	155
18	7	flowbuilder	u5cC05rbNclljDy0PifovOmV3SXCv4w859sLJiqwdz	\N	2026-02-21 16:29:29.3+00	2026-02-21 16:29:29.3+00	t	0	0	156
\.


--
-- Data for Name: WhatsappQueues; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."WhatsappQueues" ("whatsappId", "queueId", "createdAt", "updatedAt") FROM stdin;
21	4	2025-10-21 18:29:05.566+00	2025-10-21 18:29:05.566+00
61	18	2025-12-09 12:36:28.624+00	2025-12-09 12:36:28.624+00
62	18	2025-12-09 16:49:50.097+00	2025-12-09 16:49:50.097+00
72	21	2026-01-02 20:28:41.906+00	2026-01-02 20:28:41.906+00
72	22	2026-01-02 20:28:41.906+00	2026-01-02 20:28:41.906+00
72	23	2026-01-02 20:28:41.906+00	2026-01-02 20:28:41.906+00
77	24	2026-01-08 02:04:58.038+00	2026-01-08 02:04:58.038+00
77	25	2026-01-08 02:04:58.038+00	2026-01-08 02:04:58.038+00
80	27	2026-01-10 14:25:40.252+00	2026-01-10 14:25:40.252+00
81	30	2026-01-11 22:25:55.474+00	2026-01-11 22:25:55.474+00
81	31	2026-01-11 22:25:55.474+00	2026-01-11 22:25:55.474+00
81	32	2026-01-11 22:25:55.474+00	2026-01-11 22:25:55.474+00
83	33	2026-01-13 21:21:52.588+00	2026-01-13 21:21:52.588+00
\.


--
-- Data for Name: Whatsapps; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public."Whatsapps" (id, session, qrcode, status, battery, plugged, "createdAt", "updatedAt", name, "isDefault", retries, "greetingMessage", "companyId", "complationMessage", "outOfHoursMessage", token, "farewellMessage", provider, number, channel, "facebookUserToken", "tokenMeta", "facebookPageUserId", "facebookUserId", "maxUseBotQueues", "expiresTicket", "allowGroup", "timeUseBotQueues", "timeSendQueue", "sendIdQueue", "expiresInactiveMessage", "maxUseBotQueuesNPS", "inactiveMessage", "whenExpiresTicket", "expiresTicketNPS", "timeInactiveMessage", "ratingMessage", "groupAsTicket", "importOldMessages", "importRecentMessages", "statusImportMessages", "closedTicketsPostImported", "importOldMessagesGroups", "timeCreateNewTicket", "greetingMediaAttachment", "promptId", "integrationId", schedules, "collectiveVacationEnd", "collectiveVacationStart", "collectiveVacationMessage", "queueIdImportMessages", "flowIdNotPhrase", "flowIdWelcome", wavoip, "notificameHub", "coexistencePhoneNumberId", "coexistenceWabaId", "coexistencePermanentToken", "coexistenceEnabled", "businessAppConnected", "messageRoutingMode", "routingRules", "lastCoexistenceSync") FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.appointments (id, title, description, start_datetime, duration_minutes, status, schedule_id, service_id, client_id, contact_id, company_id, created_at, updated_at, google_event_id) FROM stdin;
\.


--
-- Data for Name: company_api_keys; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.company_api_keys (id, company_id, label, token, webhook_url, webhook_secret, active, last_used_at, "createdAt", "updatedAt") FROM stdin;
1	1	Integração	073ea129db057eb3ac51fb9f26e0d30a488820b8ee8f14841c006f4c3874020624a708954b61f7a0ea44c8df580f4d30	\N	\N	t	2026-01-23 17:32:34.858	2025-12-23 03:45:52.56	2026-01-23 17:32:34.858
\.


--
-- Data for Name: company_integration_field_maps; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.company_integration_field_maps (id, integration_id, external_field, crm_field, transform_expression, options, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_integration_settings; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.company_integration_settings (id, company_id, name, provider, base_url, api_key, api_secret, webhook_secret, metadata, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_payment_settings; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.company_payment_settings (id, company_id, provider, token, additional_data, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_client_contacts; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.crm_client_contacts (id, client_id, contact_id, role, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_clients; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.crm_clients (id, company_id, type, name, company_name, document, birth_date, email, phone, zip_code, address, number, complement, neighborhood, city, state, status, client_since, owner_user_id, notes, created_at, updated_at, contact_id, primary_ticket_id, asaas_customer_id, lid) FROM stdin;
\.


--
-- Data for Name: crm_leads; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.crm_leads (id, company_id, name, email, phone, birth_date, document, company_name, "position", source, campaign, medium, status, score, temperature, owner_user_id, notes, last_activity_at, created_at, updated_at, contact_id, primary_ticket_id, converted_client_id, converted_at, lead_status, lid) FROM stdin;
\.


--
-- Data for Name: financeiro_faturas; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.financeiro_faturas (id, company_id, client_id, descricao, valor, status, data_vencimento, data_pagamento, tipo_referencia, referencia_id, tipo_recorrencia, quantidade_ciclos, ciclo_atual, data_inicio, data_fim, ativa, observacoes, created_at, updated_at, valor_pago, payment_provider, payment_link, payment_external_id, checkout_token, project_id) FROM stdin;
\.


--
-- Data for Name: financeiro_pagamentos; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.financeiro_pagamentos (id, company_id, fatura_id, metodo_pagamento, valor, data_pagamento, observacoes, created_at) FROM stdin;
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.media_files (id, folder_id, company_id, original_name, custom_name, mime_type, size, storage_path, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media_folders; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.media_folders (id, name, description, company_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: profissionais; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.profissionais (id, "companyId", nome, servicos, agenda, ativo, comissao, "valorEmAberto", "valoresRecebidos", "valoresAReceber", "createdAt", "updatedAt") FROM stdin;
1	1	Rafael	[{"id": 1, "nome": "Corte de cabelo", "valorOriginal": "25.00", "possuiDesconto": false, "valorComDesconto": null}, {"id": 2, "nome": "Corte e Barba", "valorOriginal": "50.00", "possuiDesconto": true, "valorComDesconto": "40.00"}]	[{"dia": "segunda-feira", "fim": "17:00", "inicio": "10:00", "almocoFim": "13:30", "almocoInicio": "12:00", "duracaoAtendimento": 30}, {"dia": "quarta-feira", "fim": "17:00", "inicio": "10:00", "almocoFim": "13:30", "almocoInicio": "12:00", "duracaoAtendimento": 30}]	t	20.00	0.00	0.00	0.00	2025-12-05 19:47:13.774	2025-12-05 19:47:26.848
2	1	Katellin	[{"id": 3, "nome": "Luzes", "valorOriginal": "70.00", "possuiDesconto": false, "valorComDesconto": null}]	[{"dia": "sexta-feira", "fim": "22:00", "inicio": "10:00", "almocoFim": "16:00", "almocoInicio": "13:00", "duracaoAtendimento": 90}]	t	20.00	0.00	0.00	0.00	2025-12-05 19:52:24.081	2025-12-05 19:52:24.081
\.


--
-- Data for Name: project_products; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.project_products (id, "companyId", "projectId", "productId", quantity, "unitPrice", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: project_services; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.project_services (id, "companyId", "projectId", "serviceId", quantity, "unitPrice", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: project_task_users; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.project_task_users (id, "companyId", "taskId", "userId", responsibility, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: project_tasks; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.project_tasks (id, "companyId", "projectId", title, description, status, "order", "startDate", "dueDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: project_users; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.project_users (id, "companyId", "projectId", "userId", role, "effortAllocation", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.projects (id, "companyId", "clientId", "invoiceId", name, description, "deliveryTime", warranty, terms, status, "startDate", "endDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: scheduled_dispatch_logs; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.scheduled_dispatch_logs (id, dispatcher_id, contact_id, ticket_id, company_id, status, error_message, sent_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: scheduled_dispatchers; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.scheduled_dispatchers (id, company_id, title, message_template, event_type, whatsapp_id, start_time, send_interval_seconds, days_before_due, days_after_due, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: servicos; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.servicos (id, "companyId", nome, descricao, "valorOriginal", "possuiDesconto", "valorComDesconto", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: slider_home; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.slider_home (id, name, image, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tutorial_videos; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.tutorial_videos (id, title, description, video_url, thumbnail_url, company_id, user_id, is_active, views_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_schedules; Type: TABLE DATA; Schema: public; Owner: empresa
--

COPY public.user_schedules (id, name, description, active, user_id, company_id, created_at, updated_at, user_google_calendar_integration_id) FROM stdin;
\.


--
-- Name: AffiliateCommissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."AffiliateCommissions_id_seq"', 1, false);


--
-- Name: AffiliateLinks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."AffiliateLinks_id_seq"', 5, true);


--
-- Name: AffiliateWithdrawals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."AffiliateWithdrawals_id_seq"', 1, false);


--
-- Name: Affiliates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Affiliates_id_seq"', 3, true);


--
-- Name: Announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Announcements_id_seq"', 1, true);


--
-- Name: ApiUsages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ApiUsages_id_seq"', 4, true);


--
-- Name: AutomationActions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."AutomationActions_id_seq"', 7, true);


--
-- Name: AutomationExecutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."AutomationExecutions_id_seq"', 1, false);


--
-- Name: AutomationLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."AutomationLogs_id_seq"', 1, false);


--
-- Name: Automations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Automations_id_seq"', 5, true);


--
-- Name: Baileys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Baileys_id_seq"', 3588, true);


--
-- Name: CallRecords_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."CallRecords_id_seq"', 1, false);


--
-- Name: CampaignSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."CampaignSettings_id_seq"', 16, true);


--
-- Name: CampaignShipping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."CampaignShipping_id_seq"', 1, false);


--
-- Name: Campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Campaigns_id_seq"', 1, false);


--
-- Name: ChatMessages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ChatMessages_id_seq"', 1, false);


--
-- Name: ChatUsers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ChatUsers_id_seq"', 1, false);


--
-- Name: Chatbots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Chatbots_id_seq"', 1, false);


--
-- Name: Chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Chats_id_seq"', 1, false);


--
-- Name: CompaniesSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."CompaniesSettings_id_seq"', 117, true);


--
-- Name: Companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Companies_id_seq"', 158, true);


--
-- Name: ContactCustomFields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ContactCustomFields_id_seq"', 1, false);


--
-- Name: ContactGroups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ContactGroups_id_seq"', 1, false);


--
-- Name: ContactListItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ContactListItems_id_seq"', 1, false);


--
-- Name: ContactLists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ContactLists_id_seq"', 1, false);


--
-- Name: ContactWallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ContactWallets_id_seq"', 1, false);


--
-- Name: Contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Contacts_id_seq"', 4, true);


--
-- Name: Coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Coupons_id_seq"', 2, true);


--
-- Name: DialogChatBots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."DialogChatBots_id_seq"', 1, false);


--
-- Name: Faturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Faturas_id_seq"', 1, false);


--
-- Name: Ferramentas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Ferramentas_id_seq"', 15, true);


--
-- Name: FilesOptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."FilesOptions_id_seq"', 3, true);


--
-- Name: Files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Files_id_seq"', 3, true);


--
-- Name: FlowAudios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."FlowAudios_id_seq"', 1, false);


--
-- Name: FlowBuilders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."FlowBuilders_id_seq"', 71, true);


--
-- Name: FlowCampaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."FlowCampaigns_id_seq"', 1, false);


--
-- Name: FlowDefaults_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."FlowDefaults_id_seq"', 1, false);


--
-- Name: FlowImgs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."FlowImgs_id_seq"', 18, true);


--
-- Name: GoogleCalendarIntegrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."GoogleCalendarIntegrations_id_seq"', 1, false);


--
-- Name: GoogleSheetsTokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."GoogleSheetsTokens_id_seq"', 1, false);


--
-- Name: Helps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Helps_id_seq"', 1, false);


--
-- Name: IaWorkflows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."IaWorkflows_id_seq"', 32, true);


--
-- Name: Integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Integrations_id_seq"', 1, false);


--
-- Name: Invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Invoices_id_seq"', 128, true);


--
-- Name: Languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Languages_id_seq"', 3, true);


--
-- Name: LogTickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."LogTickets_id_seq"', 34, true);


--
-- Name: MediaFiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."MediaFiles_id_seq"', 1, false);


--
-- Name: MediaFolders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."MediaFolders_id_seq"', 1, false);


--
-- Name: Messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Messages_id_seq"', 14, true);


--
-- Name: MobileWebhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."MobileWebhooks_id_seq"', 1, false);


--
-- Name: Negocios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Negocios_id_seq"', 32, true);


--
-- Name: Partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Partners_id_seq"', 1, false);


--
-- Name: Plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Plans_id_seq"', 5, true);


--
-- Name: ProdutoCategorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ProdutoCategorias_id_seq"', 3, true);


--
-- Name: ProdutoVariacaoGrupos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ProdutoVariacaoGrupos_id_seq"', 3, true);


--
-- Name: ProdutoVariacaoItens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ProdutoVariacaoItens_id_seq"', 1, true);


--
-- Name: ProdutoVariacaoOpcoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ProdutoVariacaoOpcoes_id_seq"', 4, true);


--
-- Name: Produtos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Produtos_id_seq"', 23, true);


--
-- Name: PromptToolSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."PromptToolSettings_id_seq"', 1, false);


--
-- Name: Prompts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Prompts_id_seq"', 1, false);


--
-- Name: QueueIntegrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."QueueIntegrations_id_seq"', 13, true);


--
-- Name: QueueOptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."QueueOptions_id_seq"', 1, false);


--
-- Name: Queues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Queues_id_seq"', 56, true);


--
-- Name: QuickMessages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."QuickMessages_id_seq"', 1, false);


--
-- Name: ScheduledMessagesEnvios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ScheduledMessagesEnvios_id_seq"', 1, false);


--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."ScheduledMessages_id_seq"', 1, false);


--
-- Name: Schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Schedules_id_seq"', 1, false);


--
-- Name: Settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Settings_id_seq"', 111, true);


--
-- Name: SliderBanners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."SliderBanners_id_seq"', 1, false);


--
-- Name: Subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Subscriptions_id_seq"', 1, false);


--
-- Name: Tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Tags_id_seq"', 107, true);


--
-- Name: TicketNotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."TicketNotes_id_seq"', 1, false);


--
-- Name: TicketTraking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."TicketTraking_id_seq"', 4, true);


--
-- Name: Tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Tickets_id_seq"', 3, true);


--
-- Name: Translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Translations_id_seq"', 353, true);


--
-- Name: UserDevices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."UserDevices_id_seq"', 1, false);


--
-- Name: UserGoogleCalendarIntegrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."UserGoogleCalendarIntegrations_id_seq"', 1, false);


--
-- Name: UserPagePermissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."UserPagePermissions_id_seq"', 1215, true);


--
-- Name: UserRatings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."UserRatings_id_seq"', 1, false);


--
-- Name: UserServices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."UserServices_id_seq"', 1, false);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Users_id_seq"', 9, true);


--
-- Name: Versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Versions_id_seq"', 1, false);


--
-- Name: Webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Webhooks_id_seq"', 18, true);


--
-- Name: Whatsapps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public."Whatsapps_id_seq"', 1, true);


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.appointments_id_seq', 1, false);


--
-- Name: company_api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.company_api_keys_id_seq', 1, true);


--
-- Name: company_integration_field_maps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.company_integration_field_maps_id_seq', 1, false);


--
-- Name: company_integration_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.company_integration_settings_id_seq', 1, false);


--
-- Name: company_payment_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.company_payment_settings_id_seq', 3, true);


--
-- Name: crm_client_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.crm_client_contacts_id_seq', 1, false);


--
-- Name: crm_clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.crm_clients_id_seq', 1, false);


--
-- Name: crm_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.crm_leads_id_seq', 4, true);


--
-- Name: financeiro_faturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.financeiro_faturas_id_seq', 1, false);


--
-- Name: financeiro_pagamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.financeiro_pagamentos_id_seq', 1, false);


--
-- Name: media_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.media_files_id_seq', 1, false);


--
-- Name: media_folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.media_folders_id_seq', 1, false);


--
-- Name: profissionais_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.profissionais_id_seq', 2, true);


--
-- Name: project_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.project_products_id_seq', 1, false);


--
-- Name: project_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.project_services_id_seq', 1, false);


--
-- Name: project_task_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.project_task_users_id_seq', 1, false);


--
-- Name: project_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.project_tasks_id_seq', 1, false);


--
-- Name: project_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.project_users_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: scheduled_dispatch_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.scheduled_dispatch_logs_id_seq', 1, false);


--
-- Name: scheduled_dispatchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.scheduled_dispatchers_id_seq', 1, false);


--
-- Name: servicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.servicos_id_seq', 7, true);


--
-- Name: slider_home_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.slider_home_id_seq', 8, true);


--
-- Name: tutorial_videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.tutorial_videos_id_seq', 1, false);


--
-- Name: user_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: empresa
--

SELECT pg_catalog.setval('public.user_schedules_id_seq', 1, false);


--
-- Name: AffiliateCommissions AffiliateCommissions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateCommissions"
    ADD CONSTRAINT "AffiliateCommissions_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateLinks AffiliateLinks_code_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateLinks"
    ADD CONSTRAINT "AffiliateLinks_code_key" UNIQUE (code);


--
-- Name: AffiliateLinks AffiliateLinks_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateLinks"
    ADD CONSTRAINT "AffiliateLinks_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateWithdrawals AffiliateWithdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateWithdrawals"
    ADD CONSTRAINT "AffiliateWithdrawals_pkey" PRIMARY KEY (id);


--
-- Name: Affiliates Affiliates_affiliateCode_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Affiliates"
    ADD CONSTRAINT "Affiliates_affiliateCode_key" UNIQUE ("affiliateCode");


--
-- Name: Affiliates Affiliates_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Affiliates"
    ADD CONSTRAINT "Affiliates_pkey" PRIMARY KEY (id);


--
-- Name: Announcements Announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Announcements"
    ADD CONSTRAINT "Announcements_pkey" PRIMARY KEY (id);


--
-- Name: ApiUsages ApiUsages_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ApiUsages"
    ADD CONSTRAINT "ApiUsages_pkey" PRIMARY KEY (id);


--
-- Name: AutomationActions AutomationActions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationActions"
    ADD CONSTRAINT "AutomationActions_pkey" PRIMARY KEY (id);


--
-- Name: AutomationExecutions AutomationExecutions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationExecutions"
    ADD CONSTRAINT "AutomationExecutions_pkey" PRIMARY KEY (id);


--
-- Name: AutomationLogs AutomationLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationLogs"
    ADD CONSTRAINT "AutomationLogs_pkey" PRIMARY KEY (id);


--
-- Name: Automations Automations_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Automations"
    ADD CONSTRAINT "Automations_pkey" PRIMARY KEY (id);


--
-- Name: Baileys Baileys_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Baileys"
    ADD CONSTRAINT "Baileys_pkey" PRIMARY KEY (id, "whatsappId");


--
-- Name: CallRecords CallRecords_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CallRecords"
    ADD CONSTRAINT "CallRecords_pkey" PRIMARY KEY (id);


--
-- Name: CampaignSettings CampaignSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CampaignSettings"
    ADD CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY (id);


--
-- Name: CampaignShipping CampaignShipping_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CampaignShipping"
    ADD CONSTRAINT "CampaignShipping_pkey" PRIMARY KEY (id);


--
-- Name: Campaigns Campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessages ChatMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_pkey" PRIMARY KEY (id);


--
-- Name: ChatUsers ChatUsers_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatUsers"
    ADD CONSTRAINT "ChatUsers_pkey" PRIMARY KEY (id);


--
-- Name: Chatbots Chatbots_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_pkey" PRIMARY KEY (id);


--
-- Name: Chats Chats_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_pkey" PRIMARY KEY (id);


--
-- Name: CompaniesSettings CompaniesSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CompaniesSettings"
    ADD CONSTRAINT "CompaniesSettings_pkey" PRIMARY KEY (id);


--
-- Name: Companies Companies_name_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_name_key" UNIQUE (name);


--
-- Name: Companies Companies_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_pkey" PRIMARY KEY (id);


--
-- Name: ContactCustomFields ContactCustomFields_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactCustomFields"
    ADD CONSTRAINT "ContactCustomFields_pkey" PRIMARY KEY (id);


--
-- Name: ContactGroups ContactGroups_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactGroups"
    ADD CONSTRAINT "ContactGroups_pkey" PRIMARY KEY (id);


--
-- Name: ContactListItems ContactListItems_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactListItems"
    ADD CONSTRAINT "ContactListItems_pkey" PRIMARY KEY (id);


--
-- Name: ContactLists ContactLists_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactLists"
    ADD CONSTRAINT "ContactLists_pkey" PRIMARY KEY (id);


--
-- Name: ContactWallets ContactWallets_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_pkey" PRIMARY KEY (id);


--
-- Name: Contacts Contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT "Contacts_pkey" PRIMARY KEY (id);


--
-- Name: Coupons Coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key" UNIQUE (code);


--
-- Name: Coupons Coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_pkey" PRIMARY KEY (id);


--
-- Name: DialogChatBots DialogChatBots_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_pkey" PRIMARY KEY (id);


--
-- Name: Faturas Faturas_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Faturas"
    ADD CONSTRAINT "Faturas_pkey" PRIMARY KEY (id);


--
-- Name: Ferramentas Ferramentas_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Ferramentas"
    ADD CONSTRAINT "Ferramentas_pkey" PRIMARY KEY (id);


--
-- Name: FilesOptions FilesOptions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FilesOptions"
    ADD CONSTRAINT "FilesOptions_pkey" PRIMARY KEY (id);


--
-- Name: Files Files_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "Files_pkey" PRIMARY KEY (id);


--
-- Name: FlowAudios FlowAudios_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowAudios"
    ADD CONSTRAINT "FlowAudios_pkey" PRIMARY KEY (id);


--
-- Name: FlowBuilders FlowBuilders_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowBuilders"
    ADD CONSTRAINT "FlowBuilders_pkey" PRIMARY KEY (id);


--
-- Name: FlowCampaigns FlowCampaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowCampaigns"
    ADD CONSTRAINT "FlowCampaigns_pkey" PRIMARY KEY (id);


--
-- Name: FlowDefaults FlowDefaults_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowDefaults"
    ADD CONSTRAINT "FlowDefaults_pkey" PRIMARY KEY (id);


--
-- Name: FlowImgs FlowImgs_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowImgs"
    ADD CONSTRAINT "FlowImgs_pkey" PRIMARY KEY (id);


--
-- Name: GoogleCalendarIntegrations GoogleCalendarIntegrations_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleCalendarIntegrations"
    ADD CONSTRAINT "GoogleCalendarIntegrations_pkey" PRIMARY KEY (id);


--
-- Name: GoogleSheetsTokens GoogleSheetsTokens_companyId_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleSheetsTokens"
    ADD CONSTRAINT "GoogleSheetsTokens_companyId_key" UNIQUE ("companyId");


--
-- Name: GoogleSheetsTokens GoogleSheetsTokens_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleSheetsTokens"
    ADD CONSTRAINT "GoogleSheetsTokens_pkey" PRIMARY KEY (id);


--
-- Name: Helps Helps_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Helps"
    ADD CONSTRAINT "Helps_pkey" PRIMARY KEY (id);


--
-- Name: IaWorkflows IaWorkflows_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."IaWorkflows"
    ADD CONSTRAINT "IaWorkflows_pkey" PRIMARY KEY (id);


--
-- Name: Integrations Integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_pkey" PRIMARY KEY (id);


--
-- Name: Invoices Invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_pkey" PRIMARY KEY (id);


--
-- Name: Languages Languages_code_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Languages"
    ADD CONSTRAINT "Languages_code_key" UNIQUE (code);


--
-- Name: Languages Languages_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Languages"
    ADD CONSTRAINT "Languages_pkey" PRIMARY KEY (id);


--
-- Name: LogTickets LogTickets_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_pkey" PRIMARY KEY (id);


--
-- Name: MediaFiles MediaFiles_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MediaFiles"
    ADD CONSTRAINT "MediaFiles_pkey" PRIMARY KEY (id);


--
-- Name: MediaFolders MediaFolders_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MediaFolders"
    ADD CONSTRAINT "MediaFolders_pkey" PRIMARY KEY (id);


--
-- Name: Messages Messages_id_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_id_key" UNIQUE (id);


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);


--
-- Name: MobileWebhooks MobileWebhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MobileWebhooks"
    ADD CONSTRAINT "MobileWebhooks_pkey" PRIMARY KEY (id);


--
-- Name: Negocios Negocios_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Negocios"
    ADD CONSTRAINT "Negocios_pkey" PRIMARY KEY (id);


--
-- Name: Partners Partners_document_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_document_key" UNIQUE (document);


--
-- Name: Partners Partners_name_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_name_key" UNIQUE (name);


--
-- Name: Partners Partners_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_pkey" PRIMARY KEY (id);


--
-- Name: Plans Plans_name_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_name_key" UNIQUE (name);


--
-- Name: Plans Plans_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_pkey" PRIMARY KEY (id);


--
-- Name: ProdutoCategorias ProdutoCategorias_companyId_nome_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoCategorias"
    ADD CONSTRAINT "ProdutoCategorias_companyId_nome_key" UNIQUE ("companyId", nome);


--
-- Name: ProdutoCategorias ProdutoCategorias_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoCategorias"
    ADD CONSTRAINT "ProdutoCategorias_pkey" PRIMARY KEY (id);


--
-- Name: ProdutoVariacaoGrupos ProdutoVariacaoGrupos_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoGrupos"
    ADD CONSTRAINT "ProdutoVariacaoGrupos_pkey" PRIMARY KEY (id);


--
-- Name: ProdutoVariacaoItens ProdutoVariacaoItens_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoItens"
    ADD CONSTRAINT "ProdutoVariacaoItens_pkey" PRIMARY KEY (id);


--
-- Name: ProdutoVariacaoOpcoes ProdutoVariacaoOpcoes_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoOpcoes"
    ADD CONSTRAINT "ProdutoVariacaoOpcoes_pkey" PRIMARY KEY (id);


--
-- Name: Produtos Produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Produtos"
    ADD CONSTRAINT "Produtos_pkey" PRIMARY KEY (id);


--
-- Name: PromptToolSettings PromptToolSettings_company_prompt_tool_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."PromptToolSettings"
    ADD CONSTRAINT "PromptToolSettings_company_prompt_tool_unique" UNIQUE ("companyId", "promptId", "toolName");


--
-- Name: PromptToolSettings PromptToolSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."PromptToolSettings"
    ADD CONSTRAINT "PromptToolSettings_pkey" PRIMARY KEY (id);


--
-- Name: Prompts Prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Prompts"
    ADD CONSTRAINT "Prompts_pkey" PRIMARY KEY (id);


--
-- Name: QueueIntegrations QueueIntegrations_name_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_name_key" UNIQUE (name);


--
-- Name: QueueIntegrations QueueIntegrations_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_pkey" PRIMARY KEY (id);


--
-- Name: QueueIntegrations QueueIntegrations_projectName_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_projectName_key" UNIQUE ("projectName");


--
-- Name: QueueOptions QueueOptions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueOptions"
    ADD CONSTRAINT "QueueOptions_pkey" PRIMARY KEY (id);


--
-- Name: Queues Queues_color_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_color_key" UNIQUE (color, "companyId");


--
-- Name: Queues Queues_name_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_name_key" UNIQUE (name, "companyId");


--
-- Name: Queues Queues_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_pkey" PRIMARY KEY (id);


--
-- Name: QuickMessages QuickMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QuickMessages"
    ADD CONSTRAINT "QuickMessages_pkey" PRIMARY KEY (id);


--
-- Name: ScheduledMessagesEnvios ScheduledMessagesEnvios_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ScheduledMessagesEnvios"
    ADD CONSTRAINT "ScheduledMessagesEnvios_pkey" PRIMARY KEY (id);


--
-- Name: ScheduledMessages ScheduledMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ScheduledMessages"
    ADD CONSTRAINT "ScheduledMessages_pkey" PRIMARY KEY (id);


--
-- Name: Schedules Schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: SliderBanners SliderBanners_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."SliderBanners"
    ADD CONSTRAINT "SliderBanners_pkey" PRIMARY KEY (id);


--
-- Name: Subscriptions Subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_pkey" PRIMARY KEY (id);


--
-- Name: Tags Tags_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tags"
    ADD CONSTRAINT "Tags_pkey" PRIMARY KEY (id);


--
-- Name: TicketNotes TicketNotes_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_pkey" PRIMARY KEY (id);


--
-- Name: TicketTraking TicketTraking_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_pkey" PRIMARY KEY (id);


--
-- Name: Tickets Tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_pkey" PRIMARY KEY (id);


--
-- Name: Translations Translations_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Translations"
    ADD CONSTRAINT "Translations_pkey" PRIMARY KEY (id);


--
-- Name: UserDevices UserDevices_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserDevices"
    ADD CONSTRAINT "UserDevices_pkey" PRIMARY KEY (id);


--
-- Name: UserDevices UserDevices_userId_deviceToken_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserDevices"
    ADD CONSTRAINT "UserDevices_userId_deviceToken_key" UNIQUE ("userId", "deviceToken");


--
-- Name: UserGoogleCalendarIntegrations UserGoogleCalendarIntegrations_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserGoogleCalendarIntegrations"
    ADD CONSTRAINT "UserGoogleCalendarIntegrations_pkey" PRIMARY KEY (id);


--
-- Name: UserPagePermissions UserPagePermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserPagePermissions"
    ADD CONSTRAINT "UserPagePermissions_pkey" PRIMARY KEY (id);


--
-- Name: UserPagePermissions UserPagePermissions_userId_pagePath_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserPagePermissions"
    ADD CONSTRAINT "UserPagePermissions_userId_pagePath_key" UNIQUE ("userId", "pagePath");


--
-- Name: UserQueues UserQueues_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserQueues"
    ADD CONSTRAINT "UserQueues_pkey" PRIMARY KEY ("userId", "queueId");


--
-- Name: UserRatings UserRatings_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_pkey" PRIMARY KEY (id);


--
-- Name: UserServices UserServices_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserServices"
    ADD CONSTRAINT "UserServices_pkey" PRIMARY KEY (id);


--
-- Name: UserServices UserServices_userId_serviceId_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserServices"
    ADD CONSTRAINT "UserServices_userId_serviceId_key" UNIQUE ("userId", "serviceId");


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Versions Versions_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Versions"
    ADD CONSTRAINT "Versions_pkey" PRIMARY KEY (id);


--
-- Name: Webhooks Webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Webhooks"
    ADD CONSTRAINT "Webhooks_pkey" PRIMARY KEY (id);


--
-- Name: WhatsappQueues WhatsappQueues_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."WhatsappQueues"
    ADD CONSTRAINT "WhatsappQueues_pkey" PRIMARY KEY ("whatsappId", "queueId");


--
-- Name: Whatsapps Whatsapps_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_pkey" PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: company_api_keys company_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_api_keys
    ADD CONSTRAINT company_api_keys_pkey PRIMARY KEY (id);


--
-- Name: company_api_keys company_api_keys_token_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_api_keys
    ADD CONSTRAINT company_api_keys_token_key UNIQUE (token);


--
-- Name: company_integration_field_maps company_integration_field_maps_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_integration_field_maps
    ADD CONSTRAINT company_integration_field_maps_pkey PRIMARY KEY (id);


--
-- Name: company_integration_settings company_integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_integration_settings
    ADD CONSTRAINT company_integration_settings_pkey PRIMARY KEY (id);


--
-- Name: company_payment_settings company_payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_payment_settings
    ADD CONSTRAINT company_payment_settings_pkey PRIMARY KEY (id);


--
-- Name: Tickets contactid_companyid_whatsappid_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT contactid_companyid_whatsappid_unique UNIQUE (id, "contactId", "companyId", "whatsappId");


--
-- Name: Contacts contacts_company_number_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT contacts_company_number_unique UNIQUE ("companyId", number);


--
-- Name: crm_client_contacts crm_client_contacts_client_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_client_contacts
    ADD CONSTRAINT crm_client_contacts_client_id_contact_id_key UNIQUE (client_id, contact_id);


--
-- Name: crm_client_contacts crm_client_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_client_contacts
    ADD CONSTRAINT crm_client_contacts_pkey PRIMARY KEY (id);


--
-- Name: crm_clients crm_clients_company_id_document_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_clients
    ADD CONSTRAINT crm_clients_company_id_document_key UNIQUE (company_id, document);


--
-- Name: crm_clients crm_clients_company_id_document_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_clients
    ADD CONSTRAINT crm_clients_company_id_document_unique UNIQUE (company_id, document);


--
-- Name: crm_clients crm_clients_company_id_email_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_clients
    ADD CONSTRAINT crm_clients_company_id_email_unique UNIQUE (company_id, email);


--
-- Name: crm_clients crm_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_clients
    ADD CONSTRAINT crm_clients_pkey PRIMARY KEY (id);


--
-- Name: crm_leads crm_leads_company_id_email_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_company_id_email_key UNIQUE (company_id, email);


--
-- Name: crm_leads crm_leads_company_id_email_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_company_id_email_unique UNIQUE (company_id, email);


--
-- Name: crm_leads crm_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_pkey PRIMARY KEY (id);


--
-- Name: financeiro_faturas financeiro_faturas_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_faturas
    ADD CONSTRAINT financeiro_faturas_id_company_unique UNIQUE (id, company_id);


--
-- Name: financeiro_faturas financeiro_faturas_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_faturas
    ADD CONSTRAINT financeiro_faturas_pkey PRIMARY KEY (id);


--
-- Name: financeiro_pagamentos financeiro_pagamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_pagamentos
    ADD CONSTRAINT financeiro_pagamentos_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- Name: Contacts number_companyid_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT number_companyid_unique UNIQUE (number, "companyId");


--
-- Name: ProdutoVariacaoItens produto_variacao_unique; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoItens"
    ADD CONSTRAINT produto_variacao_unique UNIQUE ("produtoId", "opcaoId");


--
-- Name: profissionais profissionais_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.profissionais
    ADD CONSTRAINT profissionais_pkey PRIMARY KEY (id);


--
-- Name: project_products project_products_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_products
    ADD CONSTRAINT project_products_pkey PRIMARY KEY (id);


--
-- Name: project_services project_services_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_services
    ADD CONSTRAINT project_services_pkey PRIMARY KEY (id);


--
-- Name: project_task_users project_task_users_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_task_users
    ADD CONSTRAINT project_task_users_pkey PRIMARY KEY (id);


--
-- Name: project_tasks project_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_pkey PRIMARY KEY (id);


--
-- Name: project_users project_users_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: scheduled_dispatch_logs scheduled_dispatch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatch_logs
    ADD CONSTRAINT scheduled_dispatch_logs_pkey PRIMARY KEY (id);


--
-- Name: scheduled_dispatchers scheduled_dispatchers_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatchers
    ADD CONSTRAINT scheduled_dispatchers_pkey PRIMARY KEY (id);


--
-- Name: servicos servicos_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.servicos
    ADD CONSTRAINT servicos_pkey PRIMARY KEY (id);


--
-- Name: slider_home slider_home_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.slider_home
    ADD CONSTRAINT slider_home_pkey PRIMARY KEY (id);


--
-- Name: tutorial_videos tutorial_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.tutorial_videos
    ADD CONSTRAINT tutorial_videos_pkey PRIMARY KEY (id);


--
-- Name: user_schedules user_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.user_schedules
    ADD CONSTRAINT user_schedules_pkey PRIMARY KEY (id);


--
-- Name: user_schedules user_schedules_user_id_key; Type: CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.user_schedules
    ADD CONSTRAINT user_schedules_user_id_key UNIQUE (user_id);


--
-- Name: MediaFiles_company_id_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "MediaFiles_company_id_idx" ON public."MediaFiles" USING btree (company_id);


--
-- Name: MediaFiles_folder_id_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "MediaFiles_folder_id_idx" ON public."MediaFiles" USING btree (folder_id);


--
-- Name: MediaFolders_company_id_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "MediaFolders_company_id_idx" ON public."MediaFolders" USING btree (company_id);


--
-- Name: automation_actions_automation_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_actions_automation_id ON public."AutomationActions" USING btree ("automationId");


--
-- Name: automation_actions_order; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_actions_order ON public."AutomationActions" USING btree ("order");


--
-- Name: automation_executions_automation_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_executions_automation_id ON public."AutomationExecutions" USING btree ("automationId");


--
-- Name: automation_executions_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_executions_contact_id ON public."AutomationExecutions" USING btree ("contactId");


--
-- Name: automation_executions_scheduled_at; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_executions_scheduled_at ON public."AutomationExecutions" USING btree ("scheduledAt");


--
-- Name: automation_executions_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_executions_status ON public."AutomationExecutions" USING btree (status);


--
-- Name: automation_logs_automation_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_logs_automation_id ON public."AutomationLogs" USING btree ("automationId");


--
-- Name: automation_logs_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_logs_contact_id ON public."AutomationLogs" USING btree ("contactId");


--
-- Name: automation_logs_executed_at; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_logs_executed_at ON public."AutomationLogs" USING btree ("executedAt");


--
-- Name: automation_logs_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_logs_status ON public."AutomationLogs" USING btree (status);


--
-- Name: automation_logs_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automation_logs_ticket_id ON public."AutomationLogs" USING btree ("ticketId");


--
-- Name: automations_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automations_company_id ON public."Automations" USING btree ("companyId");


--
-- Name: automations_is_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automations_is_active ON public."Automations" USING btree ("isActive");


--
-- Name: automations_trigger_type; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX automations_trigger_type ON public."Automations" USING btree ("triggerType");


--
-- Name: company_api_keys_company_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX company_api_keys_company_active ON public.company_api_keys USING btree (company_id, active);


--
-- Name: company_integration_field_maps_unique; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX company_integration_field_maps_unique ON public.company_integration_field_maps USING btree (integration_id, external_field);


--
-- Name: company_integration_settings_company_name; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX company_integration_settings_company_name ON public.company_integration_settings USING btree (company_id, name);


--
-- Name: company_payment_settings_company_provider; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX company_payment_settings_company_provider ON public.company_payment_settings USING btree (company_id, provider);


--
-- Name: contacts_lid_index; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX contacts_lid_index ON public."Contacts" USING btree (lid);


--
-- Name: crm_clients_asaas_customer_id_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX crm_clients_asaas_customer_id_idx ON public.crm_clients USING btree (asaas_customer_id) WHERE (asaas_customer_id IS NOT NULL);


--
-- Name: financeiro_faturas_checkout_token_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX financeiro_faturas_checkout_token_idx ON public.financeiro_faturas USING btree (checkout_token) WHERE (checkout_token IS NOT NULL);


--
-- Name: google_calendar_integrations_company_user_unique; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX google_calendar_integrations_company_user_unique ON public."GoogleCalendarIntegrations" USING btree ("companyId", "userId");


--
-- Name: idx_ContactCustomFields_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_ContactCustomFields_contact_id" ON public."ContactCustomFields" USING btree ("contactId");


--
-- Name: idx_LogTickets_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_LogTickets_ticket_id" ON public."LogTickets" USING btree ("ticketId");


--
-- Name: idx_Messages_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_Messages_contact_id" ON public."Messages" USING btree ("contactId");


--
-- Name: idx_TicketTags_tag_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_TicketTags_tag_id" ON public."TicketTags" USING btree ("tagId");


--
-- Name: idx_TicketTags_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_TicketTags_ticket_id" ON public."TicketTags" USING btree ("ticketId");


--
-- Name: idx_TicketTraking_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_TicketTraking_company_id" ON public."TicketTraking" USING btree ("companyId");


--
-- Name: idx_TicketTraking_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_TicketTraking_ticket_id" ON public."TicketTraking" USING btree ("ticketId");


--
-- Name: idx_affiliate_commissions_affiliateId; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_affiliate_commissions_affiliateId" ON public."AffiliateCommissions" USING btree ("affiliateId");


--
-- Name: idx_affiliate_commissions_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_affiliate_commissions_status ON public."AffiliateCommissions" USING btree (status);


--
-- Name: idx_affiliate_links_affiliateId; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_affiliate_links_affiliateId" ON public."AffiliateLinks" USING btree ("affiliateId");


--
-- Name: idx_affiliate_links_code; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_affiliate_links_code ON public."AffiliateLinks" USING btree (code);


--
-- Name: idx_affiliate_withdrawals_affiliateId; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_affiliate_withdrawals_affiliateId" ON public."AffiliateWithdrawals" USING btree ("affiliateId");


--
-- Name: idx_affiliate_withdrawals_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_affiliate_withdrawals_status ON public."AffiliateWithdrawals" USING btree (status);


--
-- Name: idx_appointments_google_event_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_appointments_google_event_id ON public.appointments USING btree (google_event_id);


--
-- Name: idx_client_contacts_contact; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_client_contacts_contact ON public.crm_client_contacts USING btree (contact_id);


--
-- Name: idx_clients_company; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_clients_company ON public.crm_clients USING btree (company_id);


--
-- Name: idx_clients_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_clients_status ON public.crm_clients USING btree (company_id, status);


--
-- Name: idx_cont_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_cont_company_id ON public."Contacts" USING btree ("companyId");


--
-- Name: idx_contactTag_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_contactTag_contact_id" ON public."ContactTags" USING btree ("contactId");


--
-- Name: idx_contactTag_tagId; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_contactTag_tagId" ON public."ContactTags" USING btree ("tagId");


--
-- Name: idx_contactTag_tag_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_contactTag_tag_id" ON public."ContactTags" USING btree ("tagId");


--
-- Name: idx_contact_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_contact_company_id ON public."Contacts" USING btree ("companyId");


--
-- Name: idx_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_contact_id ON public."Contacts" USING btree (id);


--
-- Name: idx_contact_name; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_contact_name ON public."Contacts" USING btree (name);


--
-- Name: idx_contact_number; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_contact_number ON public."Contacts" USING btree (number);


--
-- Name: idx_contact_whatsapp_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_contact_whatsapp_id ON public."Contacts" USING btree ("whatsappId");


--
-- Name: idx_coupons_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_coupons_active ON public."Coupons" USING btree ("isActive");


--
-- Name: idx_coupons_code; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_coupons_code ON public."Coupons" USING btree (code);


--
-- Name: idx_cpsh_campaign_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_cpsh_campaign_id ON public."CampaignShipping" USING btree ("campaignId");


--
-- Name: idx_crm_clients_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_crm_clients_contact_id ON public.crm_clients USING btree (contact_id);


--
-- Name: idx_crm_leads_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_crm_leads_contact_id ON public.crm_leads USING btree (contact_id);


--
-- Name: idx_crm_leads_lead_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_crm_leads_lead_status ON public.crm_leads USING btree (lead_status);


--
-- Name: idx_ctli_contact_list_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ctli_contact_list_id ON public."ContactListItems" USING btree ("contactListId");


--
-- Name: idx_faturas_company; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_faturas_company ON public.financeiro_faturas USING btree (company_id);


--
-- Name: idx_faturas_recorrencia; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_faturas_recorrencia ON public.financeiro_faturas USING btree (company_id, tipo_recorrencia, ativa);


--
-- Name: idx_faturas_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_faturas_status ON public.financeiro_faturas USING btree (company_id, status);


--
-- Name: idx_financeiro_faturas_company; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_financeiro_faturas_company ON public.financeiro_faturas USING btree (company_id);


--
-- Name: idx_financeiro_faturas_project_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_financeiro_faturas_project_id ON public.financeiro_faturas USING btree (project_id);


--
-- Name: idx_financeiro_faturas_recorrencia; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_financeiro_faturas_recorrencia ON public.financeiro_faturas USING btree (company_id, tipo_recorrencia, ativa);


--
-- Name: idx_financeiro_faturas_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_financeiro_faturas_status ON public.financeiro_faturas USING btree (company_id, status);


--
-- Name: idx_financeiro_pagamentos_company; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_financeiro_pagamentos_company ON public.financeiro_pagamentos USING btree (company_id);


--
-- Name: idx_flowbui_id_user_id_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_flowbui_id_user_id_active ON public."FlowBuilders" USING btree (id, user_id, active);


--
-- Name: idx_flowcamp_id_company_id_phrase; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_flowcamp_id_company_id_phrase ON public."FlowCampaigns" USING btree (id, "companyId", phrase);


--
-- Name: idx_flowdefa_id_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_flowdefa_id_company_id ON public."FlowDefaults" USING btree (id, "companyId");


--
-- Name: idx_languages_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_languages_active ON public."Languages" USING btree (active);


--
-- Name: idx_languages_code; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_languages_code ON public."Languages" USING btree (code);


--
-- Name: idx_leads_company; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_leads_company ON public.crm_leads USING btree (company_id);


--
-- Name: idx_leads_owner; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_leads_owner ON public.crm_leads USING btree (company_id, owner_user_id);


--
-- Name: idx_leads_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_leads_status ON public.crm_leads USING btree (company_id, status);


--
-- Name: idx_message_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_message_company_id ON public."Messages" USING btree ("companyId");


--
-- Name: idx_message_quoted_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_message_quoted_id ON public."Messages" USING btree ("quotedMsgId");


--
-- Name: idx_message_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_message_ticket_id ON public."Messages" USING btree ("ticketId");


--
-- Name: idx_messages_wid; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_messages_wid ON public."Messages" USING btree (wid);


--
-- Name: idx_ms_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ms_company_id ON public."Messages" USING btree ("companyId");


--
-- Name: idx_ms_company_id_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ms_company_id_ticket_id ON public."Messages" USING btree ("companyId", "ticketId");


--
-- Name: idx_produtocategorias_company; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_produtocategorias_company ON public."ProdutoCategorias" USING btree ("companyId");


--
-- Name: idx_produtos_categoria; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_produtos_categoria ON public."Produtos" USING btree ("categoriaId");


--
-- Name: idx_queues_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_queues_id ON public."Queues" USING btree (id);


--
-- Name: idx_sched_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_sched_company_id ON public."Schedules" USING btree ("companyId");


--
-- Name: idx_tg_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_tg_company_id ON public."Tags" USING btree ("companyId");


--
-- Name: idx_ticket_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ticket_company_id ON public."Tickets" USING btree ("companyId");


--
-- Name: idx_ticket_contact_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ticket_contact_id ON public."Tickets" USING btree ("contactId");


--
-- Name: idx_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ticket_id ON public."Tickets" USING btree (id);


--
-- Name: idx_ticket_queue_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ticket_queue_id ON public."Tickets" USING btree ("queueId");


--
-- Name: idx_ticket_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ticket_status ON public."Tickets" USING btree (status);


--
-- Name: idx_ticket_user_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ticket_user_id ON public."Tickets" USING btree ("userId");


--
-- Name: idx_ticket_whatsapp_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_ticket_whatsapp_id ON public."Tickets" USING btree ("whatsappId");


--
-- Name: idx_tickets_crm_client_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_tickets_crm_client_id ON public."Tickets" USING btree (crm_client_id);


--
-- Name: idx_tickets_crm_lead_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_tickets_crm_lead_id ON public."Tickets" USING btree (crm_lead_id);


--
-- Name: idx_translations_key; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_translations_key ON public."Translations" USING btree (key);


--
-- Name: idx_translations_lang_key; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_translations_lang_key ON public."Translations" USING btree ("languageCode", key);


--
-- Name: idx_translations_languageCode; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_translations_languageCode" ON public."Translations" USING btree ("languageCode");


--
-- Name: idx_tutorial_videos_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_tutorial_videos_active ON public.tutorial_videos USING btree (is_active);


--
-- Name: idx_tutorial_videos_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_tutorial_videos_company_id ON public.tutorial_videos USING btree (company_id);


--
-- Name: idx_tutorial_videos_created_at; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_tutorial_videos_created_at ON public.tutorial_videos USING btree (created_at DESC);


--
-- Name: idx_tutorial_videos_user_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_tutorial_videos_user_id ON public.tutorial_videos USING btree (user_id);


--
-- Name: idx_user_devices_deviceToken; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_user_devices_deviceToken" ON public."UserDevices" USING btree ("deviceToken");


--
-- Name: idx_user_devices_userId; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_user_devices_userId" ON public."UserDevices" USING btree ("userId");


--
-- Name: idx_user_google_calendar_integrations_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_user_google_calendar_integrations_active ON public."UserGoogleCalendarIntegrations" USING btree (active);


--
-- Name: idx_user_google_calendar_integrations_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_user_google_calendar_integrations_company_id ON public."UserGoogleCalendarIntegrations" USING btree (company_id);


--
-- Name: idx_user_google_calendar_integrations_email; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_user_google_calendar_integrations_email ON public."UserGoogleCalendarIntegrations" USING btree (email);


--
-- Name: idx_user_page_permissions_pagePath; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_user_page_permissions_pagePath" ON public."UserPagePermissions" USING btree ("pagePath");


--
-- Name: idx_user_page_permissions_userId; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX "idx_user_page_permissions_userId" ON public."UserPagePermissions" USING btree ("userId");


--
-- Name: idx_user_schedules_google_calendar_integration_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_user_schedules_google_calendar_integration_id ON public.user_schedules USING btree (user_google_calendar_integration_id);


--
-- Name: idx_userratings_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_userratings_company_id ON public."UserRatings" USING btree ("companyId");


--
-- Name: idx_userratings_ticket_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_userratings_ticket_id ON public."UserRatings" USING btree ("ticketId");


--
-- Name: idx_variacao_grupos_company; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_variacao_grupos_company ON public."ProdutoVariacaoGrupos" USING btree ("companyId");


--
-- Name: idx_variacao_itens_opcao; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_variacao_itens_opcao ON public."ProdutoVariacaoItens" USING btree ("opcaoId");


--
-- Name: idx_variacao_itens_produto; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_variacao_itens_produto ON public."ProdutoVariacaoItens" USING btree ("produtoId");


--
-- Name: idx_variacao_opcoes_grupo; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX idx_variacao_opcoes_grupo ON public."ProdutoVariacaoOpcoes" USING btree ("grupoId");


--
-- Name: media_files_company_id_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX media_files_company_id_idx ON public.media_files USING btree (company_id);


--
-- Name: media_files_folder_id_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX media_files_folder_id_idx ON public.media_files USING btree (folder_id);


--
-- Name: media_folders_company_id_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX media_folders_company_id_idx ON public.media_folders USING btree (company_id);


--
-- Name: project_products_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX project_products_company_id ON public.project_products USING btree ("companyId");


--
-- Name: project_products_unique; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX project_products_unique ON public.project_products USING btree ("projectId", "productId");


--
-- Name: project_services_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX project_services_company_id ON public.project_services USING btree ("companyId");


--
-- Name: project_services_unique; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX project_services_unique ON public.project_services USING btree ("projectId", "serviceId");


--
-- Name: project_task_users_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX project_task_users_company_id ON public.project_task_users USING btree ("companyId");


--
-- Name: project_task_users_unique; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX project_task_users_unique ON public.project_task_users USING btree ("taskId", "userId");


--
-- Name: project_tasks_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX project_tasks_company_id ON public.project_tasks USING btree ("companyId");


--
-- Name: project_tasks_project_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX project_tasks_project_id ON public.project_tasks USING btree ("projectId");


--
-- Name: project_tasks_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX project_tasks_status ON public.project_tasks USING btree (status);


--
-- Name: project_users_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX project_users_company_id ON public.project_users USING btree ("companyId");


--
-- Name: project_users_unique; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX project_users_unique ON public.project_users USING btree ("projectId", "userId");


--
-- Name: projects_client_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX projects_client_id ON public.projects USING btree ("clientId");


--
-- Name: projects_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX projects_company_id ON public.projects USING btree ("companyId");


--
-- Name: projects_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX projects_status ON public.projects USING btree (status);


--
-- Name: scheduled_dispatch_logs_dispatcher_status; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX scheduled_dispatch_logs_dispatcher_status ON public.scheduled_dispatch_logs USING btree (dispatcher_id, status);


--
-- Name: scheduled_dispatchers_company_event; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX scheduled_dispatchers_company_event ON public.scheduled_dispatchers USING btree (company_id, event_type);


--
-- Name: tickets_uuid_idx; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX tickets_uuid_idx ON public."Tickets" USING btree (uuid);


--
-- Name: tutorial_videos_company_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX tutorial_videos_company_id ON public.tutorial_videos USING btree (company_id);


--
-- Name: tutorial_videos_is_active; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX tutorial_videos_is_active ON public.tutorial_videos USING btree (is_active);


--
-- Name: tutorial_videos_user_id; Type: INDEX; Schema: public; Owner: empresa
--

CREATE INDEX tutorial_videos_user_id ON public.tutorial_videos USING btree (user_id);


--
-- Name: user_google_calendar_integrations_user_id_unique; Type: INDEX; Schema: public; Owner: empresa
--

CREATE UNIQUE INDEX user_google_calendar_integrations_user_id_unique ON public."UserGoogleCalendarIntegrations" USING btree (user_id);


--
-- Name: ProdutoCategorias trg_produtocategorias_updated_at; Type: TRIGGER; Schema: public; Owner: empresa
--

CREATE TRIGGER trg_produtocategorias_updated_at BEFORE UPDATE ON public."ProdutoCategorias" FOR EACH ROW EXECUTE FUNCTION public.update_produtocategorias_updated_at();


--
-- Name: tutorial_videos trigger_tutorial_videos_updated_at; Type: TRIGGER; Schema: public; Owner: empresa
--

CREATE TRIGGER trigger_tutorial_videos_updated_at BEFORE UPDATE ON public.tutorial_videos FOR EACH ROW EXECUTE FUNCTION public.update_tutorial_videos_updated_at();


--
-- Name: UserPagePermissions trigger_update_user_page_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: empresa
--

CREATE TRIGGER trigger_update_user_page_permissions_updated_at BEFORE UPDATE ON public."UserPagePermissions" FOR EACH ROW EXECUTE FUNCTION public.update_user_page_permissions_updated_at();


--
-- Name: UserDevices update_user_device_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: empresa
--

CREATE TRIGGER update_user_device_updated_at_trigger BEFORE UPDATE ON public."UserDevices" FOR EACH ROW EXECUTE FUNCTION public.update_user_device_updated_at();


--
-- Name: UserGoogleCalendarIntegrations update_user_google_calendar_integrations_updated_at; Type: TRIGGER; Schema: public; Owner: empresa
--

CREATE TRIGGER update_user_google_calendar_integrations_updated_at BEFORE UPDATE ON public."UserGoogleCalendarIntegrations" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: AffiliateCommissions AffiliateCommissions_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateCommissions"
    ADD CONSTRAINT "AffiliateCommissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliateCommissions AffiliateCommissions_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateCommissions"
    ADD CONSTRAINT "AffiliateCommissions_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.financeiro_faturas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AffiliateCommissions AffiliateCommissions_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateCommissions"
    ADD CONSTRAINT "AffiliateCommissions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoices"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliateCommissions AffiliateCommissions_referredCompanyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateCommissions"
    ADD CONSTRAINT "AffiliateCommissions_referredCompanyId_fkey" FOREIGN KEY ("referredCompanyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliateLinks AffiliateLinks_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateLinks"
    ADD CONSTRAINT "AffiliateLinks_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliateWithdrawals AffiliateWithdrawals_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateWithdrawals"
    ADD CONSTRAINT "AffiliateWithdrawals_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliateWithdrawals AffiliateWithdrawals_processedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AffiliateWithdrawals"
    ADD CONSTRAINT "AffiliateWithdrawals_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Affiliates Affiliates_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Affiliates"
    ADD CONSTRAINT "Affiliates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcements Announcements_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Announcements"
    ADD CONSTRAINT "Announcements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AutomationActions AutomationActions_automationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationActions"
    ADD CONSTRAINT "AutomationActions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES public."Automations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AutomationExecutions AutomationExecutions_automationActionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationExecutions"
    ADD CONSTRAINT "AutomationExecutions_automationActionId_fkey" FOREIGN KEY ("automationActionId") REFERENCES public."AutomationActions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AutomationExecutions AutomationExecutions_automationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationExecutions"
    ADD CONSTRAINT "AutomationExecutions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES public."Automations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AutomationExecutions AutomationExecutions_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationExecutions"
    ADD CONSTRAINT "AutomationExecutions_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AutomationExecutions AutomationExecutions_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationExecutions"
    ADD CONSTRAINT "AutomationExecutions_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AutomationLogs AutomationLogs_automationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationLogs"
    ADD CONSTRAINT "AutomationLogs_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES public."Automations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AutomationLogs AutomationLogs_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationLogs"
    ADD CONSTRAINT "AutomationLogs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AutomationLogs AutomationLogs_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."AutomationLogs"
    ADD CONSTRAINT "AutomationLogs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Automations Automations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Automations"
    ADD CONSTRAINT "Automations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CallRecords CallRecords_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CallRecords"
    ADD CONSTRAINT "CallRecords_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CallRecords CallRecords_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CallRecords"
    ADD CONSTRAINT "CallRecords_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CallRecords CallRecords_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CallRecords"
    ADD CONSTRAINT "CallRecords_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CallRecords CallRecords_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CallRecords"
    ADD CONSTRAINT "CallRecords_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CallRecords CallRecords_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CallRecords"
    ADD CONSTRAINT "CallRecords_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CampaignSettings CampaignSettings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CampaignSettings"
    ADD CONSTRAINT "CampaignSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignShipping CampaignShipping_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CampaignShipping"
    ADD CONSTRAINT "CampaignShipping_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaigns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignShipping CampaignShipping_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CampaignShipping"
    ADD CONSTRAINT "CampaignShipping_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."ContactListItems"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Campaigns Campaigns_contactListId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES public."ContactLists"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Campaigns Campaigns_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: ChatMessages ChatMessages_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chats"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessages ChatMessages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatUsers ChatUsers_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatUsers"
    ADD CONSTRAINT "ChatUsers_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chats"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatUsers ChatUsers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ChatUsers"
    ADD CONSTRAINT "ChatUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chatbots Chatbots_chatbotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES public."Chatbots"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chatbots Chatbots_optFileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optFileId_fkey" FOREIGN KEY ("optFileId") REFERENCES public."Files"(id);


--
-- Name: Chatbots Chatbots_optIntegrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optIntegrationId_fkey" FOREIGN KEY ("optIntegrationId") REFERENCES public."QueueIntegrations"(id);


--
-- Name: Chatbots Chatbots_optQueueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optQueueId_fkey" FOREIGN KEY ("optQueueId") REFERENCES public."Queues"(id);


--
-- Name: Chatbots Chatbots_optUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_optUserId_fkey" FOREIGN KEY ("optUserId") REFERENCES public."Users"(id);


--
-- Name: Chatbots Chatbots_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chatbots"
    ADD CONSTRAINT "Chatbots_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chats Chats_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Chats Chats_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Chats"
    ADD CONSTRAINT "Chats_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompaniesSettings CompaniesSettings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."CompaniesSettings"
    ADD CONSTRAINT "CompaniesSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Companies Companies_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliates"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Companies Companies_affiliateLinkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES public."AffiliateLinks"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Companies Companies_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Companies Companies_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plans"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Companies Companies_referredBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContactCustomFields ContactCustomFields_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactCustomFields"
    ADD CONSTRAINT "ContactCustomFields_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactListItems ContactListItems_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactListItems"
    ADD CONSTRAINT "ContactListItems_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactListItems ContactListItems_contactListId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactListItems"
    ADD CONSTRAINT "ContactListItems_contactListId_fkey" FOREIGN KEY ("contactListId") REFERENCES public."ContactLists"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactLists ContactLists_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactLists"
    ADD CONSTRAINT "ContactLists_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactTags ContactTags_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactTags"
    ADD CONSTRAINT "ContactTags_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactTags ContactTags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactTags"
    ADD CONSTRAINT "ContactTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tags"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactWallets ContactWallets_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactWallets ContactWallets_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactWallets ContactWallets_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ContactWallets"
    ADD CONSTRAINT "ContactWallets_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Contacts Contacts_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT "Contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Contacts Contacts_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Contacts"
    ADD CONSTRAINT "Contacts_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DialogChatBots DialogChatBots_chatbotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES public."Chatbots"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DialogChatBots DialogChatBots_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DialogChatBots DialogChatBots_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."DialogChatBots"
    ADD CONSTRAINT "DialogChatBots_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Faturas Faturas_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Faturas"
    ADD CONSTRAINT "Faturas_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Faturas Faturas_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Faturas"
    ADD CONSTRAINT "Faturas_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ferramentas Ferramentas_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Ferramentas"
    ADD CONSTRAINT "Ferramentas_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FilesOptions FilesOptions_fileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FilesOptions"
    ADD CONSTRAINT "FilesOptions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES public."Files"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Files Files_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "Files_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FlowCampaigns FlowCampaigns_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."FlowCampaigns"
    ADD CONSTRAINT "FlowCampaigns_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GoogleCalendarIntegrations GoogleCalendarIntegrations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleCalendarIntegrations"
    ADD CONSTRAINT "GoogleCalendarIntegrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GoogleCalendarIntegrations GoogleCalendarIntegrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleCalendarIntegrations"
    ADD CONSTRAINT "GoogleCalendarIntegrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GoogleSheetsTokens GoogleSheetsTokens_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."GoogleSheetsTokens"
    ADD CONSTRAINT "GoogleSheetsTokens_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Integrations Integrations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoices Invoices_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LogTickets LogTickets_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LogTickets LogTickets_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LogTickets LogTickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."LogTickets"
    ADD CONSTRAINT "LogTickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MediaFiles MediaFiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MediaFiles"
    ADD CONSTRAINT "MediaFiles_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON DELETE CASCADE;


--
-- Name: MediaFiles MediaFiles_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MediaFiles"
    ADD CONSTRAINT "MediaFiles_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES public."MediaFolders"(id) ON DELETE CASCADE;


--
-- Name: MediaFolders MediaFolders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MediaFolders"
    ADD CONSTRAINT "MediaFolders_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON DELETE CASCADE;


--
-- Name: Messages Messages_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Messages Messages_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Messages Messages_quotedMsgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_quotedMsgId_fkey" FOREIGN KEY ("quotedMsgId") REFERENCES public."Messages"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Messages Messages_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_ticketTrakingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_ticketTrakingId_fkey" FOREIGN KEY ("ticketTrakingId") REFERENCES public."TicketTraking"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Messages Messages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MobileWebhooks MobileWebhooks_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MobileWebhooks"
    ADD CONSTRAINT "MobileWebhooks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MobileWebhooks MobileWebhooks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."MobileWebhooks"
    ADD CONSTRAINT "MobileWebhooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Negocios Negocios_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Negocios"
    ADD CONSTRAINT "Negocios_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProdutoCategorias ProdutoCategorias_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoCategorias"
    ADD CONSTRAINT "ProdutoCategorias_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProdutoVariacaoGrupos ProdutoVariacaoGrupos_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoGrupos"
    ADD CONSTRAINT "ProdutoVariacaoGrupos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON DELETE CASCADE;


--
-- Name: ProdutoVariacaoItens ProdutoVariacaoItens_opcaoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoItens"
    ADD CONSTRAINT "ProdutoVariacaoItens_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES public."ProdutoVariacaoOpcoes"(id) ON DELETE CASCADE;


--
-- Name: ProdutoVariacaoItens ProdutoVariacaoItens_produtoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoItens"
    ADD CONSTRAINT "ProdutoVariacaoItens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES public."Produtos"(id) ON DELETE CASCADE;


--
-- Name: ProdutoVariacaoOpcoes ProdutoVariacaoOpcoes_grupoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."ProdutoVariacaoOpcoes"
    ADD CONSTRAINT "ProdutoVariacaoOpcoes_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES public."ProdutoVariacaoGrupos"(id) ON DELETE CASCADE;


--
-- Name: Produtos Produtos_categoriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Produtos"
    ADD CONSTRAINT "Produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES public."ProdutoCategorias"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Produtos Produtos_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Produtos"
    ADD CONSTRAINT "Produtos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PromptToolSettings PromptToolSettings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."PromptToolSettings"
    ADD CONSTRAINT "PromptToolSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PromptToolSettings PromptToolSettings_promptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."PromptToolSettings"
    ADD CONSTRAINT "PromptToolSettings_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES public."Prompts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prompts Prompts_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Prompts"
    ADD CONSTRAINT "Prompts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id);


--
-- Name: Prompts Prompts_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Prompts"
    ADD CONSTRAINT "Prompts_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id);


--
-- Name: QueueIntegrations QueueIntegrations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueIntegrations"
    ADD CONSTRAINT "QueueIntegrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QueueOptions QueueOptions_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueOptions"
    ADD CONSTRAINT "QueueOptions_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."QueueOptions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QueueOptions QueueOptions_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QueueOptions"
    ADD CONSTRAINT "QueueOptions_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Queues Queues_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Queues Queues_fileListId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_fileListId_fkey" FOREIGN KEY ("fileListId") REFERENCES public."Files"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Queues Queues_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Queues"
    ADD CONSTRAINT "Queues_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."QueueIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QuickMessages QuickMessages_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QuickMessages"
    ADD CONSTRAINT "QuickMessages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuickMessages QuickMessages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."QuickMessages"
    ADD CONSTRAINT "QuickMessages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Schedules Schedules_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Schedules Schedules_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Schedules Schedules_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Schedules Schedules_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Schedules Schedules_ticketUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_ticketUserId_fkey" FOREIGN KEY ("ticketUserId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Schedules Schedules_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Schedules Schedules_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Schedules"
    ADD CONSTRAINT "Schedules_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Settings Settings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SliderBanners SliderBanners_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."SliderBanners"
    ADD CONSTRAINT "SliderBanners_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscriptions Subscriptions_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tags Tags_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tags"
    ADD CONSTRAINT "Tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketNotes TicketNotes_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketNotes TicketNotes_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TicketNotes TicketNotes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketNotes"
    ADD CONSTRAINT "TicketNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TicketTags TicketTags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTags"
    ADD CONSTRAINT "TicketTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tags"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketTags TicketTags_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTags"
    ADD CONSTRAINT "TicketTags_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketTraking TicketTraking_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: TicketTraking TicketTraking_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."TicketTraking"
    ADD CONSTRAINT "TicketTraking_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON DELETE SET NULL;


--
-- Name: Tickets Tickets_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Tickets Tickets_crm_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_crm_client_id_fkey" FOREIGN KEY (crm_client_id) REFERENCES public.crm_clients(id) ON DELETE SET NULL;


--
-- Name: Tickets Tickets_crm_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_crm_lead_id_fkey" FOREIGN KEY (crm_lead_id) REFERENCES public.crm_leads(id) ON DELETE SET NULL;


--
-- Name: Tickets Tickets_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."QueueIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_queueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_queueOptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_queueOptionId_fkey" FOREIGN KEY ("queueOptionId") REFERENCES public."QueueOptions"(id) ON UPDATE SET NULL ON DELETE SET NULL;


--
-- Name: Tickets Tickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tickets Tickets_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "Tickets_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserDevices UserDevices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserDevices"
    ADD CONSTRAINT "UserDevices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: UserRatings UserRatings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON DELETE SET NULL;


--
-- Name: UserRatings UserRatings_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Tickets"(id) ON DELETE SET NULL;


--
-- Name: UserRatings UserRatings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserRatings"
    ADD CONSTRAINT "UserRatings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: UserServices UserServices_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserServices"
    ADD CONSTRAINT "UserServices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.servicos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserServices UserServices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserServices"
    ADD CONSTRAINT "UserServices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Users Users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Users Users_whatsappId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_whatsappId_fkey" FOREIGN KEY ("whatsappId") REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_flowIdNotPhrase_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_flowIdNotPhrase_fkey" FOREIGN KEY ("flowIdNotPhrase") REFERENCES public."FlowBuilders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_flowIdWelcome_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_flowIdWelcome_fkey" FOREIGN KEY ("flowIdWelcome") REFERENCES public."FlowBuilders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."QueueIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Whatsapps Whatsapps_promptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES public."Prompts"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: Whatsapps Whatsapps_queueIdImportMessages_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."Whatsapps"
    ADD CONSTRAINT "Whatsapps_queueIdImportMessages_fkey" FOREIGN KEY ("queueIdImportMessages") REFERENCES public."Queues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.crm_clients(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public."Contacts"(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.user_schedules(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.servicos(id) ON DELETE SET NULL;


--
-- Name: company_api_keys company_api_keys_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_api_keys
    ADD CONSTRAINT company_api_keys_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_integration_field_maps company_integration_field_maps_integration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_integration_field_maps
    ADD CONSTRAINT company_integration_field_maps_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.company_integration_settings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_integration_settings company_integration_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_integration_settings
    ADD CONSTRAINT company_integration_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_payment_settings company_payment_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.company_payment_settings
    ADD CONSTRAINT company_payment_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: crm_client_contacts crm_client_contacts_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_client_contacts
    ADD CONSTRAINT crm_client_contacts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.crm_clients(id) ON DELETE CASCADE;


--
-- Name: crm_client_contacts crm_client_contacts_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_client_contacts
    ADD CONSTRAINT crm_client_contacts_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public."Contacts"(id) ON DELETE CASCADE;


--
-- Name: crm_clients crm_clients_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_clients
    ADD CONSTRAINT crm_clients_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public."Contacts"(id) ON DELETE SET NULL;


--
-- Name: crm_clients crm_clients_primary_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_clients
    ADD CONSTRAINT crm_clients_primary_ticket_id_fkey FOREIGN KEY (primary_ticket_id) REFERENCES public."Tickets"(id) ON DELETE SET NULL;


--
-- Name: crm_leads crm_leads_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public."Contacts"(id) ON DELETE SET NULL;


--
-- Name: crm_leads crm_leads_converted_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_converted_client_id_fkey FOREIGN KEY (converted_client_id) REFERENCES public.crm_clients(id) ON DELETE SET NULL;


--
-- Name: crm_leads crm_leads_primary_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.crm_leads
    ADD CONSTRAINT crm_leads_primary_ticket_id_fkey FOREIGN KEY (primary_ticket_id) REFERENCES public."Tickets"(id) ON DELETE SET NULL;


--
-- Name: financeiro_faturas financeiro_faturas_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_faturas
    ADD CONSTRAINT financeiro_faturas_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financeiro_pagamentos financeiro_pagamentos_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_pagamentos
    ADD CONSTRAINT financeiro_pagamentos_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financeiro_pagamentos financeiro_pagamentos_fatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_pagamentos
    ADD CONSTRAINT financeiro_pagamentos_fatura_id_fkey FOREIGN KEY (fatura_id) REFERENCES public.financeiro_faturas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financeiro_pagamentos fk_financeiro_pagamentos_fatura; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.financeiro_pagamentos
    ADD CONSTRAINT fk_financeiro_pagamentos_fatura FOREIGN KEY (fatura_id, company_id) REFERENCES public.financeiro_faturas(id, company_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tutorial_videos fk_tutorial_videos_company; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.tutorial_videos
    ADD CONSTRAINT fk_tutorial_videos_company FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON DELETE CASCADE;


--
-- Name: tutorial_videos fk_tutorial_videos_user; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.tutorial_videos
    ADD CONSTRAINT fk_tutorial_videos_user FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: UserGoogleCalendarIntegrations fk_user_google_calendar_integrations_company_id; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserGoogleCalendarIntegrations"
    ADD CONSTRAINT fk_user_google_calendar_integrations_company_id FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserGoogleCalendarIntegrations fk_user_google_calendar_integrations_user_id; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserGoogleCalendarIntegrations"
    ADD CONSTRAINT fk_user_google_calendar_integrations_user_id FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserPagePermissions fk_user_page_permissions_user; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public."UserPagePermissions"
    ADD CONSTRAINT fk_user_page_permissions_user FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_schedules fk_user_schedules_google_calendar_integration; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.user_schedules
    ADD CONSTRAINT fk_user_schedules_google_calendar_integration FOREIGN KEY (user_google_calendar_integration_id) REFERENCES public."UserGoogleCalendarIntegrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: media_files media_files_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media_files media_files_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.media_folders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media_folders media_folders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profissionais profissionais_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.profissionais
    ADD CONSTRAINT "profissionais_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_products project_products_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_products
    ADD CONSTRAINT "project_products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_products project_products_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_products
    ADD CONSTRAINT "project_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Produtos"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_products project_products_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_products
    ADD CONSTRAINT "project_products_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_services project_services_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_services
    ADD CONSTRAINT "project_services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_services project_services_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_services
    ADD CONSTRAINT "project_services_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_services project_services_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_services
    ADD CONSTRAINT "project_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.servicos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_task_users project_task_users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_task_users
    ADD CONSTRAINT "project_task_users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_task_users project_task_users_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_task_users
    ADD CONSTRAINT "project_task_users_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.project_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_task_users project_task_users_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_task_users
    ADD CONSTRAINT "project_task_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_tasks project_tasks_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT "project_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_tasks project_tasks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT "project_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_users project_users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT "project_users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_users project_users_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT "project_users_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_users project_users_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT "project_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.crm_clients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: projects projects_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoices"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scheduled_dispatch_logs scheduled_dispatch_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatch_logs
    ADD CONSTRAINT scheduled_dispatch_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scheduled_dispatch_logs scheduled_dispatch_logs_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatch_logs
    ADD CONSTRAINT scheduled_dispatch_logs_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public."Contacts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scheduled_dispatch_logs scheduled_dispatch_logs_dispatcher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatch_logs
    ADD CONSTRAINT scheduled_dispatch_logs_dispatcher_id_fkey FOREIGN KEY (dispatcher_id) REFERENCES public.scheduled_dispatchers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scheduled_dispatch_logs scheduled_dispatch_logs_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatch_logs
    ADD CONSTRAINT scheduled_dispatch_logs_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public."Tickets"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: scheduled_dispatchers scheduled_dispatchers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatchers
    ADD CONSTRAINT scheduled_dispatchers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scheduled_dispatchers scheduled_dispatchers_whatsapp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.scheduled_dispatchers
    ADD CONSTRAINT scheduled_dispatchers_whatsapp_id_fkey FOREIGN KEY (whatsapp_id) REFERENCES public."Whatsapps"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: servicos servicos_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.servicos
    ADD CONSTRAINT "servicos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: slider_home slider_home_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.slider_home
    ADD CONSTRAINT "slider_home_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_schedules user_schedules_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.user_schedules
    ADD CONSTRAINT user_schedules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON DELETE CASCADE;


--
-- Name: user_schedules user_schedules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: empresa
--

ALTER TABLE ONLY public.user_schedules
    ADD CONSTRAINT user_schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict I3zNzRxrUv530N4nOIP9SC1YLB8XceIj5NBRzMfJHXIeAS5mAfzqgldeiaKu5zB

