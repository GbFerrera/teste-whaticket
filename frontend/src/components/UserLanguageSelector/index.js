import React, { useContext, useState, useEffect } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import LanguageIcon from "@material-ui/icons/Language";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

// Default languages (fallback if API fails)
const defaultLanguages = [
    { code: "pt-BR", name: "Português" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
];

const useStyles = makeStyles((theme) => ({
    langButton: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        color: "#ffffff",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            transform: "scale(1.05)",
        },
        "& .MuiSvgIcon-root": {
            fontSize: 20,
            color: "#ffffff",
        },
    },
    menuItem: {
        fontSize: 14,
        minWidth: 140,
        "&.active": {
            fontWeight: 700,
            backgroundColor: "rgba(59, 130, 246, 0.08)",
        },
    },
}));

const UserLanguageSelector = () => {
    const classes = useStyles();
    const [langueMenuAnchorEl, setLangueMenuAnchorEl] = useState(null);
    const [languages, setLanguages] = useState(defaultLanguages);

    const { user, socket } = useContext(AuthContext);

    useEffect(() => {
        async function fetchLanguages() {
            try {
                const { data } = await api.get("/translations/languages");
                if (data && data.length > 0) {
                    const activeLanguages = data.filter(l => l.active);
                    if (activeLanguages.length > 0) {
                        setLanguages(activeLanguages);
                    }
                }
            } catch (err) {
                console.log("Error loading languages, using defaults");
            }
        }
        fetchLanguages();
    }, []);

    const handleOpenLanguageMenu = e => {
        setLangueMenuAnchorEl(e.currentTarget);
    };

    const handleCloseLanguageMenu = () => {
        setLangueMenuAnchorEl(null);
    };

    const loadTranslationsForLanguage = async (langCode) => {
        try {
            const { data } = await api.get(`/translations/${langCode}`);
            if (data && Object.keys(data).length > 0) {
                const nested = {};
                Object.keys(data).forEach((key) => {
                    const parts = key.split(".");
                    let current = nested;
                    for (let i = 0; i < parts.length - 1; i++) {
                        if (!current[parts[i]]) current[parts[i]] = {};
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = data[key];
                });
                i18n.addResourceBundle(langCode, "translations", nested, true, true);
            }
        } catch (err) {
            console.log("Error loading translations for", langCode);
        }
    };

    const handleChangeLanguage = async language => {
        try {
            await loadTranslationsForLanguage(language);
            await i18n.changeLanguage(language);
            await api.put(`/users/${user.id}`, { language });
        } catch (err) {
            toastError(err);
        }

        handleCloseLanguageMenu();
    };

    const currentLang = i18n.language || "pt-BR";

    if (languages.length <= 1) return null;

    return (
        <>
            <Tooltip title="Idioma" placement="bottom">
                <IconButton
                    className={classes.langButton}
                    onClick={handleOpenLanguageMenu}
                >
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={langueMenuAnchorEl}
                keepMounted
                open={Boolean(langueMenuAnchorEl)}
                onClose={handleCloseLanguageMenu}
            >
                {languages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleChangeLanguage(lang.code)}
                        className={`${classes.menuItem} ${currentLang === lang.code ? "active" : ""}`}
                    >
                        {lang.name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default UserLanguageSelector;