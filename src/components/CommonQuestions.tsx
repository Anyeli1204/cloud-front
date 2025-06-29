import React from "react";

export default function CommonQuestions() {
	const faqs = [
		{
			id: 1,
			question:
				"¿Cómo se usan correctamente los filtros de scraping con ScrapeTok?",
			answer:
				"Utiliza hashtags o categorías específicas como #educación, #ciencia o #tecnología para filtrar tu scraping y obtener resultados más relevantes y precisos.",
			image:
				"https://storage.googleapis.com/mystrapi-bucket/hashtags_on_tiktok_hashtags_on_tiktok_7eb2b31160_ea577d6400/hashtags_on_tiktok_hashtags_on_tiktok_7eb2b31160_ea577d6400.jpeg",
		},
		{
			id: 2,
			question: "¿Qué es ScrapeTok y para qué sirve?",
			answer:
				"ScrapeTok es una API que permite extraer de forma automatizada metadata y métricas de publicaciones de TikTok (vistas, likes, comentarios, hashtags, sonidos, ubicación y hora) para análisis de datos.",
			image:
				"https://cdn.prod.website-files.com/651d66c14ac97bfbf614d2e5/65438822a146ca11eccd98e9_Les-statistiques-TikTok-a%CC%80-connai%CC%82tre-en-2022.jpg",
		},
		{
			id: 3,
			question: "¿Cómo autentico mis peticiones a la API de ScrapeTok?",
			answer:
				"Regístrate con el endpoint SignUp para obtener un token JWT. Luego, incluye ese token en los headers de cada petición: Authorization: Bearer <tu_token>, para validar identidad y permisos.",
			image:
				"https://scrapfly.io/blog/content/images/how-to-scrape-tiktok-python-json_banner_light.svg",
		},
	];

	return (
		<section className="mb-12">
			<h2 className="text-3xl font-bold text-center mb-6 text-purple-700">
				Preguntas frecuentes
			</h2>
			<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{faqs.map((faq) => (
					<div
						key={faq.id}
						className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-shadow duration-300"
					>
						<img
							src={faq.image}
							alt={`FAQ ${faq.id}`}
							className="w-full h-40 object-cover"
						/>
						<div className="p-4">
							<h3 className="font-semibold text-lg text-purple-600 mb-2">
								{faq.question}
							</h3>
							<p className="text-gray-700 text-sm">{faq.answer}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
