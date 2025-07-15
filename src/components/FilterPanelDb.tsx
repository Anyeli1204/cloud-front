import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
	User,
	Hash,
	Globe,
	Calendar,
	Link as LinkIcon,
	Sliders,
	RefreshCw,
	Search,
} from "lucide-react";
import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import DbHelpCarousel from "@components/DbHelpCarousel";

const MySwal = withReactContent(Swal);

interface FilterPanelDbProps {
	onApply: (filters: UserDBQueryRequest) => void;
	onReset?: () => void;
}

type NumericField =
	| "minViews"
	| "maxViews"
	| "minLikes"
	| "maxLikes"
	| "minEngagement"
	| "maxEngagement"
	| "minTotalInteractions"
	| "maxTotalInteractions";

const numericFields: Array<{
	key: NumericField;
	max: NumericField;
	label: string;
	step?: number;
}> = [
	{ key: "minViews", max: "maxViews", label: "Vistas" },
	{ key: "minLikes", max: "maxLikes", label: "Likes" },
	{
		key: "minEngagement",
		max: "maxEngagement",
		label: "Engagement",
		step: 0.01,
	},
	{
		key: "minTotalInteractions",
		max: "maxTotalInteractions",
		label: "Interacciones",
	},
];

export function FilterPanelDb({ onApply, onReset }: FilterPanelDbProps) {
	const initial: UserDBQueryRequest = {
		userId: 0,
		tiktokUsernames: "",
		postId: "",
		regionPost: "",
		datePostedFrom: "",
		datePostedTo: "",
		minViews: undefined,
		maxViews: undefined,
		minLikes: undefined,
		maxLikes: undefined,
		minEngagement: undefined,
		maxEngagement: undefined,
		minTotalInteractions: undefined,
		maxTotalInteractions: undefined,
		hashtags: "",
		soundId: "",
		soundURL: "",
	};
	const [f, setF] = useState<UserDBQueryRequest>(initial);
	const [activeTab, setActiveTab] = useState<
		"basic" | "engagement" | "advanced" | "fecha"
	>("basic");

	// Refs y altura igualada
	const filterPanelRef = useRef<HTMLDivElement>(null);
	const helpPanelRef = useRef<HTMLDivElement>(null);
	const [helpHeight, setHelpHeight] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (filterPanelRef.current && helpPanelRef.current) {
			const filterHeight = filterPanelRef.current.offsetHeight;
			setHelpHeight(filterHeight);
		}
	}, [activeTab, f]);

	const handleChange = <K extends keyof UserDBQueryRequest>(
		key: K,
		value: UserDBQueryRequest[K],
	) => {
		if (key === "tiktokUsernames") {
			setF((p) => ({ ...p, tiktokUsernames: value as string, hashtags: "" }));
		} else if (key === "hashtags") {
			setF((p) => ({ ...p, hashtags: value as string, tiktokUsernames: "" }));
		} else {
			setF((p) => ({ ...p, [key]: value }));
		}
	};

	const inputCls =
		"w-full border-2 border-purple-200 bg-white pl-10 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-purple-300 transition text-sm text-gray-900";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const hasUsers = !!f.tiktokUsernames!.trim();
		const hasTags = !!f.hashtags!.trim();

		// Validación de negativos
		const numericKeys: (keyof UserDBQueryRequest)[] = [
			"minViews",
			"maxViews",
			"minLikes",
			"maxLikes",
			"minEngagement",
			"maxEngagement",
			"minTotalInteractions",
			"maxTotalInteractions",
		];
		for (const key of numericKeys) {
			if (typeof f[key] === "number" && f[key]! < 0) {
				MySwal.fire({
					icon: "error",
					iconHtml: "❌",
					title: "<strong>¡Valor inválido!</strong>",
					html: `<div style='text-align:left; font-size:1.125rem; line-height:1.3;'>No se permiten valores negativos en los filtros numéricos.</div>`,
					background: "#fff",
					backdrop: "rgba(0,0,0,0.7)",
					customClass: {
						popup: "rounded-2xl shadow-2xl p-8 max-w-lg",
						title: "text-3xl text-red-600 mb-4",
						htmlContainer: "mt-2",
						confirmButton:
							"bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg",
					},
					showCloseButton: true,
					confirmButtonText: "Entendido",
					allowOutsideClick: false,
				});
				return;
			}
		}

		if (!(hasUsers !== hasTags)) {
			MySwal.fire({
				icon: "error",
				iconHtml: "❌",
				title: "<strong>¡Filtros inválidos!</strong>",
				html: `
          <div style="text-align:left; font-size:1.125rem; line-height:1.3;">
            <p>• <strong>Elegir uno:</strong> TikTok Usernames o Hashtags.</p>
          </div>
        `,
				background: "#fff",
				backdrop: "rgba(0,0,0,0.7)",
				customClass: {
					popup: "rounded-2xl shadow-2xl p-8 max-w-lg",
					title: "text-3xl text-red-600 mb-4",
					htmlContainer: "mt-2",
					confirmButton:
						"bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg",
				},
				showCloseButton: true,
				confirmButtonText: "Entendido",
				allowOutsideClick: false,
			});
			return;
		}

		onApply(f);
	};

	const handleReset = () => {
		setF(initial);
		onReset?.();
	};

	return (
		<div className="w-full max-w-7xl mx-auto p-6">
			<div className="flex flex-col lg:flex-row gap-6">
				<div className="flex-1 lg:flex-[3] h-full">
					<div
						ref={filterPanelRef}
						className="bg-white/80 backdrop-blur rounded-2xl shadow-lg pt-0 pb-6 px-6 min-h-[340px] h-full flex flex-col justify-center dark:bg-white/80 transition-all duration-500"
					>
						<form onSubmit={handleSubmit} className="flex flex-col h-full">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 mb-6 gap-4">
								<h1
									className="text-2xl md:text-3xl font-extrabold text-left bg-clip-text text-transparent bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900"
									style={{ fontFamily: "Nunito, sans-serif" }}
								>
									Filtros Database Queries
								</h1>
								<div className="flex gap-3 justify-end">
									<button
										type="button"
										onClick={handleReset}
										className="px-6 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm flex items-center gap-2"
									>
										<RefreshCw className="w-4 h-4" /> Limpiar
									</button>
									<button
										type="submit"
										className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg text-sm flex items-center gap-2"
									>
										<Search className="w-4 h-4" /> Aplicar
									</button>
								</div>
							</div>
							<div className="flex w-full bg-gray-100 rounded-2xl p-1 gap-0 shadow-inner mb-6">
								<button
									type="button"
									onClick={() => setActiveTab("basic")}
									className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 font-medium text-sm rounded-2xl transition-all duration-200 focus:outline-none ${activeTab === "basic" ? "bg-white text-purple-700 border-b-2 border-purple-500" : "bg-transparent text-gray-500 hover:text-purple-700"}`}
									style={{ boxShadow: undefined }}
								>
									<User
										className={`w-4 h-4 ${activeTab === "basic" ? "text-purple-500" : "text-gray-400"}`}
									/>{" "}
									Basic Filters
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("engagement")}
									className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 font-medium text-sm rounded-2xl transition-all duration-200 focus:outline-none ${activeTab === "engagement" ? "bg-white text-purple-700 border-b-2 border-purple-500" : "bg-transparent text-gray-500 hover:text-purple-700"}`}
									style={{ boxShadow: undefined }}
								>
									<Sliders
										className={`w-4 h-4 ${activeTab === "engagement" ? "text-purple-500" : "text-gray-400"}`}
									/>{" "}
									Engagement
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("advanced")}
									className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 font-medium text-sm rounded-2xl transition-all duration-200 focus:outline-none ${activeTab === "advanced" ? "bg-white text-purple-700 border-b-2 border-purple-500" : "bg-transparent text-gray-500 hover:text-purple-700"}`}
									style={{ boxShadow: undefined }}
								>
									<Globe
										className={`w-4 h-4 ${activeTab === "advanced" ? "text-purple-500" : "text-gray-400"}`}
									/>{" "}
									Advanced
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("fecha")}
									className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 font-medium text-sm rounded-2xl transition-all duration-200 focus:outline-none ${activeTab === "fecha" ? "bg-white text-purple-700 border-b-2 border-purple-500" : "bg-transparent text-gray-500 hover:text-purple-700"}`}
									style={{ boxShadow: undefined }}
								>
									<Calendar
										className={`w-4 h-4 ${activeTab === "fecha" ? "text-purple-500" : "text-gray-400"}`}
									/>{" "}
									Fecha
								</button>
							</div>
							<div className="flex flex-col gap-6 flex-1">
								{activeTab === "basic" && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block mb-1 font-medium text-gray-700">
												TikTok Usernames
											</label>
											<div className="relative">
												<User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
												<input
													type="text"
													placeholder="user1,user2"
													value={f.tiktokUsernames}
													onChange={(e) =>
														handleChange("tiktokUsernames", e.target.value)
													}
													className={inputCls}
												/>
											</div>
										</div>
										<div>
											<label className="block mb-1 font-medium text-gray-700">
												Hashtags
											</label>
											<div className="relative">
												<Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
												<input
													type="text"
													placeholder="#tag1,#tag2"
													value={f.hashtags}
													onChange={(e) =>
														handleChange("hashtags", e.target.value)
													}
													className={inputCls}
												/>
											</div>
										</div>
									</div>
								)}
								{activeTab === "engagement" && (
									<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
										{numericFields.map(({ key, max, label, step }) => (
											<div key={key}>
												<label className="block mb-1 font-medium text-gray-700">
													{label}
												</label>
												<div className="flex gap-2">
													<input
														type="number"
														step={step ?? 1}
														placeholder="Min"
														value={f[key] ?? ""}
														onChange={(e) =>
															handleChange(key, e.target.valueAsNumber)
														}
														className="w-1/2 border-2 border-purple-200 bg-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-purple-300 transition text-sm text-gray-900"
														min={0}
													/>
													<input
														type="number"
														step={step ?? 1}
														placeholder="Max"
														value={f[max] ?? ""}
														onChange={(e) =>
															handleChange(max, e.target.valueAsNumber)
														}
														className="w-1/2 border-2 border-purple-200 bg-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-purple-300 transition text-sm text-gray-900"
														min={0}
													/>
												</div>
											</div>
										))}
									</div>
								)}
								{activeTab === "advanced" && (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div>
											<label className="block mb-1 font-medium text-gray-700">
												Post ID
											</label>
											<div className="relative">
												<LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
												<input
													type="text"
													placeholder="123,456"
													value={f.postId}
													onChange={(e) =>
														handleChange("postId", e.target.value)
													}
													className={inputCls}
												/>
											</div>
										</div>
										<div>
											<label className="block mb-1 font-medium text-gray-700">
												Región
											</label>
											<div className="relative">
												<Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
												<input
													type="text"
													placeholder="US, EU..."
													value={f.regionPost}
													onChange={(e) =>
														handleChange("regionPost", e.target.value)
													}
													className={inputCls}
												/>
											</div>
										</div>
										<div>
											<label className="block mb-1 font-medium text-gray-700">
												Sound ID
											</label>
											<div className="relative">
												<LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
												<input
													type="text"
													placeholder="sound1"
													value={f.soundId}
													onChange={(e) =>
														handleChange("soundId", e.target.value)
													}
													className={inputCls}
												/>
											</div>
										</div>
									</div>
								)}
								{activeTab === "fecha" && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block mb-1 font-semibold text-gray-700">
												Fecha Desde <span className="text-purple-500">*</span>
											</label>
											<div className="relative">
												<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
												<input
													type="date"
													value={f.datePostedFrom}
													onChange={(e) =>
														handleChange("datePostedFrom", e.target.value)
													}
													className={inputCls + " dark:placeholder-gray-500"}
													required
												/>
											</div>
										</div>
										<div>
											<label className="block mb-1 font-semibold text-gray-700">
												Fecha Hasta <span className="text-purple-500">*</span>
											</label>
											<div className="relative">
												<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
												<input
													type="date"
													value={f.datePostedTo}
													onChange={(e) =>
														handleChange("datePostedTo", e.target.value)
													}
													className={inputCls + " dark:placeholder-gray-500"}
													required
												/>
											</div>
										</div>
									</div>
								)}
							</div>
						</form>
					</div>
				</div>
				<div className="lg:w-80 lg:flex-shrink-0 h-full flex items-center justify-center">
					<div
						ref={helpPanelRef}
						style={{
							height: helpHeight ? helpHeight : undefined,
							minHeight: "320px",
						}}
						className="relative w-full max-w-sm mx-auto bg-white/80 backdrop-blur rounded-2xl shadow-xl px-10 py-8 flex flex-col justify-center items-center transition-all duration-500"
					>
						<DbHelpCarousel />
					</div>
				</div>
			</div>
		</div>
	);
}
