import React, { useState, useEffect } from "react";
import { getTikTokProfile, type TikTokProfile } from "@services/tiktokProfile/tiktokProfileService";
import { Loader2, X, Users, Heart, Video, ExternalLink } from "lucide-react";

interface TikTokProfileModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TikTokProfileModal: React.FC<TikTokProfileModalProps> = ({
  username,
  isOpen,
  onClose,
}) => {
  const [profile, setProfile] = useState<TikTokProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      fetchProfile();
    }
  }, [isOpen, username]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const profileData = await getTikTokProfile(username);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🔍 Perfil de TikTok
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Cargando perfil...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-2">❌</div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {profile && (
            <div className="space-y-6">
                             {/* Avatar and Basic Info */}
               <div className="text-center">
                 {profile.avatarLarger && (
                   <img
                     src={profile.avatarLarger}
                     alt={`Avatar de ${profile.nickname || 'usuario'}`}
                     className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-200 dark:border-purple-800"
                   />
                 )}
                 <div className="flex items-center justify-center gap-2 mb-2">
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                     {profile.nickname || 'Usuario'}
                   </h3>
                   {profile.verified && (
                     <div className="bg-blue-500 text-white rounded-full p-1">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                     </div>
                   )}
                 </div>
                 {profile.uniqueId && (
                   <p className="text-purple-600 dark:text-purple-400 font-medium">
                     @{profile.uniqueId}
                   </p>
                 )}
                 {profile.signature && (
                   <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 italic">
                     "{profile.signature}"
                   </p>
                 )}
                 
                 {/* Account Status */}
                 <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                   {profile.privateAccount && (
                     <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                       🔒 Privado
                     </span>
                   )}
                   {profile.secret && (
                     <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                       ⭐ Secreto
                     </span>
                   )}
                 </div>
               </div>

                             {/* Stats */}
               {profile.stats && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                     <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                       <Users className="w-5 h-5" />
                       <span className="font-semibold">Seguidores</span>
                     </div>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                       {profile.stats.followerCount?.toLocaleString() || "0"}
                     </p>
                   </div>

                   <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                     <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                       <Heart className="w-5 h-5" />
                       <span className="font-semibold">Likes</span>
                     </div>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                       {profile.stats.heartCount?.toLocaleString() || "0"}
                     </p>
                   </div>

                   <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                     <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                       <Users className="w-5 h-5" />
                       <span className="font-semibold">Siguiendo</span>
                     </div>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                       {profile.stats.followingCount?.toLocaleString() || "0"}
                     </p>
                   </div>

                   <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                     <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                       <Video className="w-5 h-5" />
                       <span className="font-semibold">Videos</span>
                     </div>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                       {profile.stats.videoCount?.toLocaleString() || "0"}
                     </p>
                   </div>
                 </div>
               )}

               {/* Social Links */}
               {(profile.youtube_channel_id || profile.ins_id || profile.twitter_id) && (
                 <div className="space-y-3">
                   <h4 className="font-semibold text-gray-900 dark:text-white">Enlaces</h4>
                   
                   {profile.youtube_channel_id && profile.youtube_channel_title && (
                     <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                       <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                         <ExternalLink className="w-4 h-4" />
                         <span className="font-medium text-sm">YouTube</span>
                       </div>
                       <a
                         href={`https://www.youtube.com/channel/${profile.youtube_channel_id}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                       >
                         {profile.youtube_channel_title}
                       </a>
                     </div>
                   )}
                   
                   {profile.ins_id && (
                     <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
                       <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-1">
                         <ExternalLink className="w-4 h-4" />
                         <span className="font-medium text-sm">Instagram</span>
                       </div>
                       <a
                         href={`https://www.instagram.com/${profile.ins_id}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                       >
                         @{profile.ins_id}
                       </a>
                     </div>
                   )}
                   
                   {profile.twitter_id && (
                     <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                       <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                         <ExternalLink className="w-4 h-4" />
                         <span className="font-medium text-sm">Twitter</span>
                       </div>
                       <a
                         href={`https://twitter.com/${profile.twitter_id}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                       >
                         @{profile.twitter_id}
                       </a>
                     </div>
                   )}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}; 