import React from "react";
import { useState, useEffect } from "react";

interface YouTubeAudioCardProps {
	name: string;
	url: string;
}

export const YouTubeAudioCard: React.FC<YouTubeAudioCardProps> = ({
	name,
	url,
}) => {
	const extractVideoId = (youtubeUrl: string) => {
		const match = youtubeUrl.match(/v=([^&]+)/);
		return match ? match[1] : "";
	};

	const videoId = extractVideoId(url);

	const SafeYouTubePlayer = ({ videoId }: { videoId: string }) => {
		const [isValid, setIsValid] = useState(true);

		useEffect(() => {
			const testVideo = async () => {
				try {
					const response = await fetch(
						`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
					);
					if (!response.ok) throw new Error("Invalid video");
					await response.json();
					setIsValid(true);
				} catch {
					setIsValid(false);
				}
			};
			if (videoId) testVideo();
		}, [videoId]);

		if (!isValid) return <p className="text-gray-600 text-sm mt-2">{name}</p>;

		return (
			<div className="aspect-video w-full rounded-xl overflow-hidden">
				<iframe
					src={`https://www.youtube.com/embed/${videoId}`}
					title="YouTube video"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="w-full h-full"
				/>
			</div>
		);
	};

	return (
		<div className="bg-white rounded-lg shadow-sm p-2 w-full max-w-xs">
			<h3 className="text-xs font-semibold mb-1">{name}</h3>
			<SafeYouTubePlayer videoId={videoId} />
		</div>
	);
};
