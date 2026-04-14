import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

// Desregistrar qualquer Service Worker existente para remover PWA
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.getRegistrations().then((registrations) => {
		registrations.forEach((registration) => {
			registration.unregister();
			console.log('[SW] Service Worker desregistrado');
		});
	});
	// Limpar caches
	if ('caches' in window) {
		caches.keys().then((cacheNames) => {
			cacheNames.forEach((cacheName) => {
				caches.delete(cacheName);
			});
		});
	}
}

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root"),
	() => {
		// Verificar se a função existe antes de chamar
		if (typeof window.finishProgress === 'function') {
			window.finishProgress();
		}
	}
);