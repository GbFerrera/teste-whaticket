import React, { useState, useEffect, useContext } from "react";
import { makeStyles, Tabs, Tab, Typography } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";
import UploaderCert from "../../components/Settings/UploaderCert";
import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";
import ForbiddenPage from "../../components/ForbiddenPage/index.js";
import Empresa from "../../pages/Empresa";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    width: "100%",
    margin: 0,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: theme.spacing(0.5),
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  tabsContainer: {
    background: "#ffffff",
    borderRadius: 12,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(3),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  tabs: {
    "& .MuiTabs-indicator": {
      backgroundColor: "#3b82f6",
      height: 3,
      borderRadius: 2
    }
  },
  tab: {
    textTransform: "none",
    fontWeight: 500,
    fontSize: "14px",
    minHeight: 48,
    color: "#6b7280",
    "&.Mui-selected": {
      color: "#3b82f6",
      fontWeight: 600
    }
  },
  tabContent: {
    width: "100%"
  }
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [oldSettings, setOldSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { find, updateSchedules } = useCompanies();

  //novo hook
  const { getAll: getAllSettings } = useCompanySettings();
  const { getAll: getAllSettingsOld } = useSettings();
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = user.companyId;
        const company = await find(companyId);

        const settingList = await getAllSettings(companyId);

        const settingListOld = await getAllSettingsOld();

        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);
        setOldSettings(settingListOld);

        /*  if (Array.isArray(settingList)) {
           const scheduleType = settingList.find(
             (d) => d.key === "scheduleType"
           );
           if (scheduleType) {
             setSchedulesEnabled(scheduleType.value === "company");
           }
         } */
        setSchedulesEnabled(settingList.scheduleType === "company");
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.container}>
      <div className={classes.pageHeader}>
        <Typography className={classes.pageTitle}>Configurações</Typography>
        <Typography className={classes.pageSubtitle}>
          Gerencie as configurações do sistema
        </Typography>
      </div>

      <div className={classes.tabsContainer}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          className={classes.tabs}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Opções" value="options" className={classes.tab} />
          {schedulesEnabled && <Tab label="Horários" value="schedules" className={classes.tab} />}
          {isSuper() && <Tab label="Empresas" value="companies" className={classes.tab} />}
          {isSuper() && <Tab label="Planos" value="plans" className={classes.tab} />}
          {isSuper() && <Tab label="Whitelabel" value="whitelabel" className={classes.tab} />}
          {isSuper() && <Tab label="Cadastro" value="cadastro" className={classes.tab} />}
        </Tabs>
      </div>

      <div className={classes.tabContent}>
        <TabPanel value={tab} name="options">
          <Options
            settings={settings}
            oldSettings={oldSettings}
            user={currentUser}
            scheduleTypeChanged={(value) =>
              setSchedulesEnabled(value === "company")
            }
          />
        </TabPanel>

        <TabPanel value={tab} name="schedules">
          <SchedulesForm
            loading={loading}
            onSubmit={handleSubmitSchedules}
            initialValues={schedules}
          />
        </TabPanel>

        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <>
              <TabPanel value={tab} name="companies">
                <CompaniesManager />
              </TabPanel>

              <TabPanel value={tab} name="plans">
                <PlansManager />
              </TabPanel>

              <TabPanel value={tab} name="helps">
                <HelpsManager />
              </TabPanel>

              <TabPanel value={tab} name="whitelabel">
                <Whitelabel settings={oldSettings} />
              </TabPanel>

              <TabPanel value={tab} name="uploadercert">
                <UploaderCert />
              </TabPanel>

              <TabPanel value={tab} name="cadastro">
                <Empresa />
              </TabPanel>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default SettingsCustom;