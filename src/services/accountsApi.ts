import axios, {
	AxiosRequestConfig,
	AxiosResponse,
	RawAxiosRequestHeaders,
} from "axios";

export default class AccountsApi {
	private static _instance: AccountsApi | null = null;

	private _basePath: string;

	private constructor(basePath: string) {
		this._basePath = basePath;
	}

	public static async getInstance() {
		if (!this._instance) {
			// URL específica para el microservicio de accounts
			const basePath = "http://localhost:8081/api/v1";
			this._instance = new AccountsApi(basePath);
		}
		return this._instance;
	}

	private async request<RequestType, ResponseType>(config: AxiosRequestConfig) {
		const headers: RawAxiosRequestHeaders = {
			"Content-Type": "application/json",
		};

		const token = sessionStorage.getItem("token");
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		const configOptions: AxiosRequestConfig = {
			...config,
			baseURL: this._basePath,
			headers: headers,
		};

		return axios<RequestType, AxiosResponse<ResponseType>>(
			configOptions,
		);
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
