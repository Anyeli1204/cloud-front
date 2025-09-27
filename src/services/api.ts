import axios, {
	AxiosRequestConfig,
	AxiosResponse,
	RawAxiosRequestHeaders,
} from "axios";

export type ApiServiceKey = "legacy" | "accounts" | "content";

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
