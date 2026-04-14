import api, { openApi } from "../../services/api";

const usePlans = () => {

    const getPlanList = async (params) => {
        const { data } = await openApi.request({
            url: '/plans/list',
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/plans/all',
            method: 'GET',
            params
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/plans',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/plans/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const getPlanCompany = async (params, id) => {
        const { data } = await api.request({
            url: `/companies/listPlan/${id}`,
            method: 'GET',
            params
        });

        const defaultPlanPermissions = {
            useWhatsapp: true,
            useFacebook: true,
            useInstagram: true,
            useCampaigns: true,
            useSchedules: true,
            useInternalChat: true,
            useExternalApi: true,
            useKanban: true,
            useOpenAi: true,
            useIntegrations: true
        };

        const normalizedPlan = {
            ...defaultPlanPermissions,
            ...(data?.plan || {})
        };

        return {
            ...data,
            plan: normalizedPlan
        };
    }

    return {
        getPlanList,
        list,
        save,
        update,
        remove,
        getPlanCompany
    }
}

export default usePlans;