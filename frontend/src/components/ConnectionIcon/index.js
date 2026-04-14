import React from "react";

import { grey } from "@material-ui/core/colors";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";

const CONNECTION_COLORS = {
	whatsapp: "#25D366",
	instagram: "#E4405F",
	facebook: "#1877F2",
};

const ConnectionIcon = ({ connectionType, size = 18 }) => {
	const color = CONNECTION_COLORS[connectionType] || grey[500];
	const iconStyle = { color, fontSize: size, verticalAlign: "middle", display: "inline-flex", alignItems: "center" };

	return (
		<React.Fragment>
			{connectionType === "whatsapp" && <WhatsAppIcon style={iconStyle} />}
			{connectionType === "instagram" && <InstagramIcon style={iconStyle} />}
			{connectionType === "facebook" && <FacebookIcon style={iconStyle} />}
		</React.Fragment>
	);
};

export default ConnectionIcon;
