import { useEffect } from "react";

interface TikTokEmbedProps {
	url: string;
}

export default function TikTokEmbed({ url }: TikTokEmbedProps) {
	const videoIdMatch = url.match(/video\/(\d+)/);
	const videoId = videoIdMatch ? videoIdMatch[1] : "";

	if (!videoId) {
		return <div className="text-red-500">⚠️ URL inválida de TikTok</div>;
	}

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://www.tiktok.com/embed.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, [videoId]);

	return (
		<blockquote
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
