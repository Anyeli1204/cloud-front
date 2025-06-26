import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
	const navigate = useNavigate();
	return (
		<>
			<main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
				<h1 id="notFound" className="text-4xl font-bold text-gray-800 mb-4">
					404 - Page Not Found
				</h1>
				<p id="notFoundPath" className="text-lg text-gray-600 mb-8">
					URL:{" "}
					<code className="bg-gray-200 px-2 py-1 rounded">
						{location.pathname}
					</code>
				</p>
				<button
					id="historyBack"
					onClick={() => navigate(-1)}
					className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-full transition"
				>
					Back
				</button>
			</main>
		</>
	);
}
