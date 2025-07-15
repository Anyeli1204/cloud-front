import axios from "axios";

export interface TikTokProfile {
  id?: string;
  uniqueId?: string;
  nickname?: string;
  avatarThumb?: string;
  avatarMedium?: string;
  avatarLarger?: string;
  signature?: string;
  verified?: boolean;
  secUid?: string;
  secret?: boolean;
  ftc?: boolean;
  relation?: number;
  openFavorite?: boolean;
  commentSetting?: unknown;
  duetSetting?: unknown;
  stitchSetting?: unknown;
  privateAccount?: boolean;
  isADVirtual?: boolean;
  isUnderAge18?: boolean;
  ins_id?: string;
  twitter_id?: string;
  youtube_channel_title?: string;
  youtube_channel_id?: string;
  stats?: {
    followingCount?: number;
    followerCount?: number;
    heartCount?: number;
    videoCount?: number;
    diggCount?: number;
    heart?: number;
  };
}

export const getTikTokProfile = async (username: string): Promise<TikTokProfile> => {
  try {
    const response = await axios.get(
      "https://tiktok-scraper7.p.rapidapi.com/user/info",
      {
        params: { unique_id: username },
        headers: {
          "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY!,
          "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
        },
      }
    );

    // Verificar que la respuesta tenga la estructura esperada
    if (!response.data || !response.data.data || !response.data.data.user) {
      throw new Error("❌ La respuesta de la API no tiene el formato esperado.");
    }

    return response.data.data.user;
  } catch (error) {
    console.error("Error fetching TikTok profile:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("❌ Usuario no encontrado. Verifica el nombre de usuario.");
      } else if (error.response?.status === 401) {
        throw new Error("❌ Error de autenticación. Verifica tu API key.");
      } else if (error.response?.status === 429) {
        throw new Error("❌ Límite de consultas excedido. Intenta más tarde.");
      }
    }
    
    throw new Error("❌ No se pudo obtener el perfil. Verifica el nombre de usuario.");
  }
}; 