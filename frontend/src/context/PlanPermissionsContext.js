import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import moment from "moment";

import { AuthContext } from "./Auth/AuthContext";
import usePlans from "../hooks/usePlans";

const defaultState = {
  loading: true,
  planActive: true,
  campaigns: false,
  openAi: false,
  kanban: false,
  internalChat: false,
  schedules: false,
  integrations: false,
  externalApi: false,
};

const PlanPermissionsContext = createContext({
  ...defaultState,
  canAccess: () => false,
});

export const PlanPermissionsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();

  const [state, setState] = useState(defaultState);

  useEffect(() => {
    let isMounted = true;

    const loadPlan = async () => {
      if (!user?.companyId) {
        setState((prev) => ({ ...defaultState, loading: false }));
        return;
      }

      try {
        const planConfigs = await getPlanCompany(undefined, user.companyId);
        if (!isMounted) return;

        const plan = planConfigs?.plan || {};
        if (planConfigs?.plan) {
          // Se a empresa estiver ativa, plano permanece ativo mesmo com fatura vencida
          const isExpired = moment().isBefore(user.company?.dueDate);
          const planActive = user.company?.status ? true : isExpired;
          
          setState({
            loading: false,
            planActive,
            campaigns: Boolean(plan.useCampaigns),
            openAi: Boolean(plan.useOpenAi),
            kanban: Boolean(plan.useKanban),
            internalChat: Boolean(plan.useInternalChat),
            schedules: Boolean(plan.useSchedules),
            integrations: Boolean(plan.useIntegrations),
            externalApi: Boolean(plan.useExternalApi),
          });
        } else {
          setState((prev) => ({ ...defaultState, loading: false }));
        }
      } catch (err) {
        if (isMounted) {
          setState((prev) => ({ ...defaultState, loading: false }));
        }
      }
    };

    loadPlan();

    return () => {
      isMounted = false;
    };
  }, [user?.companyId, user?.company?.dueDate]);

  const value = useMemo(() => {
    const canAccess = (featureKey) => {
      if (!featureKey) return true;
      return Boolean(state[featureKey]);
    };

    return { ...state, canAccess };
  }, [state]);

  return (
    <PlanPermissionsContext.Provider value={value}>
      {children}
    </PlanPermissionsContext.Provider>
  );
};

export const usePlanPermissions = () => {
  return useContext(PlanPermissionsContext);
};

export default PlanPermissionsContext;
