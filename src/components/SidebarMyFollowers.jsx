import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function SidebarMyFollowers() {
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/subscription/me/following", { params: { limit: 20, offset: 0 } })
      .then((res) => setFollowing(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm p-4 min-w-0 overflow-hidden">
      <h3 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100 mb-3">
        Siguiendo
      </h3>

      {following.length === 0 ? (
        <p className="text-xs text-mariner-400 dark:text-zinc-500">
          Aún no sigues a nadie.
        </p>
      ) : (
        <ul className="space-y-1 min-w-0">
          {following.map((f) => {
            const nick = f.nick_name || f.user?.nick_name || f.user?.name || "?";
            const targetId = f.id || f.user?.id;
            return (
              <li
                key={targetId}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-mariner-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors min-w-0"
                onClick={() => navigate(`/users/${targetId}`)}
              >
                <div className="w-6 h-6 rounded-full bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-zinc-400 flex items-center justify-center text-xs font-bold flex-none">
                  {nick.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-mariner-700 dark:text-zinc-400 truncate flex-1 min-w-0">
                  {nick}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
