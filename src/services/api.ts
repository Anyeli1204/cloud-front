import axios, {
	AxiosRequestConfig,
	AxiosResponse,
	RawAxiosRequestHeaders,
} from "axios";

interface Env {
	VITE_LEGACY_SERVICE_URL?: string;
	VITE_ACCOUNTS_SERVICE_URL?: string;
	VITE_CONTENT_SERVICE_URL?: string;
	VITE_DASHBOARD_SERVICE_URL?: string;
	VITE_ORCHESTRATOR_SERVICE_URL?: string;
	VITE_ANALYTICS_SERVICE_URL?: string;
}

export type ApiServiceKey =
	| "legacy"
	| "accounts"
	| "content"
	| "dashboard"
	| "orchestrator"
	| "analytics";

const env = import.meta.env as Env;

const legacyBase = env.VITE_LEGACY_SERVICE_URL || "http://localhost:8000";
const accountsBase = env.VITE_ACCOUNTS_SERVICE_URL || "http://localhost:8001";
const contentBase = env.VITE_CONTENT_SERVICE_URL || "http://localhost:8002";
const dashboardBase = env.VITE_DASHBOARD_SERVICE_URL || "http://localhost:8003";
const orchestratorBase =
	env.VITE_ORCHESTRATOR_SERVICE_URL || "http://localhost:5000";
const analyticsBase = env.VITE_ANALYTICS_SERVICE_URL || "http://localhost:8006";

type ApiConfig = {
	basePath: string;
	includeAuthHeader?: boolean;
	includeUserHeaders?: boolean;
};

export default class Api {
	private static _instances: Map<ApiServiceKey, Api> = new Map();

	private readonly _config: ApiConfig;

	private constructor(config: ApiConfig) {
		this._config = config;
	}

	public static async getInstance(service: ApiServiceKey = "legacy") {
		if (!this._instances.has(service)) {
			const config = this.resolveConfig(service);
			this._instances.set(service, new Api(config));
		}
		return this._instances.get(service)!;
	}

	private static resolveConfig(service: ApiServiceKey): ApiConfig {
		const env = import.meta.env;
		const defaultBase = env.VITE_API_BASE_URL || "/api";
		const accountsBase = env.VITE_ACCOUNTS_SERVICE_URL || defaultBase;
		const contentBase = env.VITE_CONTENT_SERVICE_URL || defaultBase;
		const dashboardBase = env.VITE_DASHBOARD_SERVICE_URL || defaultBase;
		const orchestratorBase = env.VITE_ORCHESTRATOR_SERVICE_URL || "http://localhost:5005";
		const analyticsBase = env.VITE_ANALYTICS_SERVICE_URL || "http://localhost:8006";

		switch (service) {
			case "accounts":
				return {
					basePath: accountsBase,
					includeAuthHeader: true,
				};
			case "content":
				return {
					basePath: contentBase,
					includeAuthHeader: true,
					includeUserHeaders: true,
				};
			case "dashboard":
				return {
					basePath: dashboardBase,
					includeAuthHeader: false,
					includeUserHeaders: false,
				};
			case "orchestrator":
				return {
					basePath: orchestratorBase,
					includeAuthHeader: false,
					includeUserHeaders: false,
				};
			case "analytics":
				return {
					basePath: analyticsBase,
					includeAuthHeader: false,
					includeUserHeaders: false,
				};
			case "legacy":
			default:
				return {
					basePath: defaultBase,
					includeAuthHeader: true,
				};
		}
	}

	private static getStoredValue(key: string): string | null {
		if (typeof window === "undefined") {
			return null;
		}

		try {
			const sessionValue = window.sessionStorage?.getItem(key);
			if (sessionValue) {
				return sessionValue;
			}
		} catch (error) {
			console.warn("SessionStorage unavailable", error);
		}

		try {
			return window.localStorage?.getItem(key) ?? null;
		} catch (error) {
			console.warn("LocalStorage unavailable", error);
			return null;
		}
	}

	private buildHeaders(
		providedHeaders?: RawAxiosRequestHeaders,
	): RawAxiosRequestHeaders {
		const headers: RawAxiosRequestHeaders = {
			"Content-Type": "application/json",
			...(providedHeaders ?? {}),
		};

		if (this._config.includeAuthHeader) {
			const token = Api.getStoredValue("token");
			if (token && !headers["Authorization"]) {
				headers["Authorization"] = `Bearer ${token}`;
			}
		}

		if (this._config.includeUserHeaders) {
			const userId = Api.getStoredValue("id");
			const role = Api.getStoredValue("role");
			if (userId && !headers["x-user-id"]) {
				headers["x-user-id"] = userId;
			}
			if (role && !headers["x-user-role"]) {
				headers["x-user-role"] = role;
			}
		}

		return headers;
	}

	private async request<RequestType, ResponseType>(config: AxiosRequestConfig) {
		const providedHeaders =
			(config.headers as RawAxiosRequestHeaders | undefined) ?? undefined;
		const headers = this.buildHeaders(providedHeaders);

		const configOptions: AxiosRequestConfig = {
			...config,
			baseURL: this._config.basePath,
			headers,
		};

		return axios<RequestType, AxiosResponse<ResponseType>>(configOptions);
	}

	public get<RequestType, ResponseType>(config: AxiosRequestConfig) {
		const configOptions: AxiosRequestConfig = {
			...config,
			method: "GET",
		};

		return this.request<RequestType, ResponseType>(configOptions);
	}

	public post<RequestBodyType, ResponseBodyType>(
		data: RequestBodyType,
		options: AxiosRequestConfig,
	) {
		const configOptions: AxiosRequestConfig = {
			...options,
			method: "POST",
			data,
		};

		return this.request<RequestBodyType, ResponseBodyType>(configOptions);
	}

	public delete(options: AxiosRequestConfig) {
		const configOptions: AxiosRequestConfig = {
			...options,
			method: "DELETE",
		};

		return this.request<void, void>(configOptions);
	}

	public put<RequestBodyType, ResponseBodyType>(
		data: RequestBodyType,
		options: AxiosRequestConfig,
	) {
		const configOptions: AxiosRequestConfig = {
			...options,
			method: "PUT",
			data: data,
		};

		return this.request<RequestBodyType, ResponseBodyType>(configOptions);
	}

	public patch<RequestBodyType, ResponseBodyType>(
		data: RequestBodyType,
		options: AxiosRequestConfig,
	) {
		const configOptions: AxiosRequestConfig = {
			...options,
			method: "PATCH",
			data: data,
		};

		return this.request<RequestBodyType, ResponseBodyType>(configOptions);
	}
}
