import React, { useState } from "react";
import { UpdateUserInput } from "@interfaces/update_user_information/UpdateUserInput";
import { X } from "lucide-react";
import { useAuthContext } from "@contexts/AuthContext";
import Api from "@services/api";

interface EditProfileModalProps {
	userId: number;
	initialData: UpdateUserInput;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function EditProfileModal({
	userId,
	initialData,
	onClose,
	onSuccess,
}: EditProfileModalProps) {
	const [formData, setFormData] = useState<UpdateUserInput>(initialData);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { session } = useAuthContext();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);
			setError(null);
			const api = await Api.getInstance("accounts");
			await api.put<UpdateUserInput, unknown>(formData, {
				url: `/auth/profile/${userId}`,
			});
			onSuccess?.();
			onClose();
		} catch (err: any) {
			setError("Error al actualizar la información");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
			<div className="bg-gradient-to-br from-pink-100 to-white dark:from-purple-900 dark:to-purple-800 w-full max-w-md p-6 rounded-xl shadow-xl relative border border-purple-300 dark:border-purple-400">
				<button
					onClick={onClose}
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
				>
					<X size={20} />
				</button>
				<h2 className="text-2xl font-bold text-purple-700 dark:text-purple-200 mb-1">
					Editar Perfil
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
					Actualiza tu información personal y hazla brillar ✨
				</p>

				<div className="space-y-4">
					<div>
						<label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Nombre</label>
						<input
							type="text"
							name="firstname"
							value={formData.firstname}
							onChange={handleChange}
							className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Apellido</label>
						<input
							type="text"
							name="lastname"
							value={formData.lastname}
							onChange={handleChange}
							className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
							Nombre de usuario
						</label>
						<input
							type="text"
							name="username"
							value={formData.username}
							onChange={handleChange}
							className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
						/>
					</div>
				</div>

				{error && <p className="text-sm text-red-500 dark:text-red-400 mt-3">{error}</p>}

				<div className="flex justify-end mt-6 gap-2">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
					>
						Cancelar
					</button>
					<button
						onClick={handleSubmit}
						className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded hover:opacity-90 disabled:opacity-50 transition-all"
						disabled={loading}
					>
						{loading ? "Guardando..." : "Guardar cambios"}
					</button>
				</div>
				<div>
					<label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Correo electrónico</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
					/>
				</div>
			</div>
		</div>
	);
}
