import { useEffect, useRef } from "react";

interface TikTokEmbedProps {
	url: string;
	onLoad?: () => void; // <-- Agregado
}

export default function TikTokEmbed({ url, onLoad }: TikTokEmbedProps) {
	const videoIdMatch = url.match(/video\/(\d+)/);
	const videoId = videoIdMatch ? videoIdMatch[1] : "";

	const blockRef = useRef<HTMLQuoteElement>(null);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://www.tiktok.com/embed.js";
		script.async = true;
		document.body.appendChild(script);

		let observer: MutationObserver | null = null;

		if (blockRef.current && onLoad) {
			observer = new MutationObserver(() => {
				// Cuando TikTok reemplaza el contenido (ya no es solo el <section>), disparamos onLoad una sola vez
				if (
					blockRef.current &&
					blockRef.current.querySelector("iframe") // TikTok reemplaza el contenido por un iframe
				) {
					onLoad();
					if (observer) observer.disconnect();
				}
			});
			observer.observe(blockRef.current, { childList: true, subtree: true });
		}

		return () => {
			document.body.removeChild(script);
			if (observer) observer.disconnect();
		};
	}, [videoId, onLoad]);
	if (!videoId) {
		return <div className="text-red-500">⚠️ URL inválida de TikTok</div>;
	}

	return (
		<blockquote
			ref={blockRef}
			className="tiktok-embed"
			cite={url}
			data-video-id={videoId}
			data-width="325"
			data-height="576"
			style={{
				width: 325,
				height: 560,
				borderRadius: 18,
				overflow: "hidden",
				background: "#f4f4f4",
			}}
		>
			<section>Loading TikTok...</section>
		</blockquote>
	);
}
