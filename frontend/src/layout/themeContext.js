import React from "react";

const ColorModeContext = React.createContext({
    toggleColorMode: () => { },
    setPrimaryColorLight: (_) => { },
    setPrimaryColorDark: (_) => { },
    setAppLogoLight: (_) => { },
    setAppLogoDark: (_) => { },
    setAppLogoFavicon: (_) => { },
    setAppLogoLoading: (_) => { },
    setSidebarIconColor: (_) => { },
    setSidebarTextColor: (_) => { },
    setSidebarActiveBg: (_) => { },
    setSidebarActiveColor: (_) => { },
    setSidebarHoverBg: (_) => { },
});

export default ColorModeContext;