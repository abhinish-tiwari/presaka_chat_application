import { Avatar, Badge, Button } from "@components/ui";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { openProfileModal } from "@store/uiStore";
import { logout } from "@store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SettingsTab = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const user = useAppSelector((state) => state.auth.user);

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
		toast.success("Logged out successfully");
	};

	return (
		<div className="px-3 py-3 space-y-4">
			{/* User Card */}
			<div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
				<div className="flex items-center gap-3 mb-4">
					<Avatar
						size="lg"
						alt={user?.name || ""}
						className="rounded-full shadow-md"
					/>
					<div className="min-w-0 flex-1">
						<h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
							{user?.name}
						</h3>
						<p className="text-xs text-gray-500 truncate">{user?.phone}</p>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => dispatch(openProfileModal())}
							className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 hover:underline p-0">
							Edit Profile
						</Button>
					</div>
				</div>

				{/* Settings Options */}
				<div className="space-y-1">
					<button
						onClick={() => dispatch(openProfileModal())}
						className="w-full flex items-center justify-between p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all group">
						<div className="flex items-center gap-2.5">
							<div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
								Account Settings
							</span>
						</div>
						<svg
							className="w-4 h-4 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<button className="w-full flex items-center justify-between p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all group">
						<div className="flex items-center gap-2.5">
							<div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
									/>
								</svg>
							</div>
							<span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
								Notifications
							</span>
						</div>
						<Badge
							variant="default"
							className="bg-gray-100 dark:bg-gray-800 text-[10px] uppercase font-bold px-2 py-0.5">
							Soon
						</Badge>
					</button>
				</div>
			</div>

			{/* Logout */}
			<div className="space-y-2 px-1">
				<button
					onClick={handleLogout}
					className="w-full flex items-center gap-2.5 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-semibold text-sm">
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					Sign Out
				</button>
				<div className="text-center pt-1">
					<p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.15em]">
						Preṣaka v1.0.0
					</p>
				</div>
			</div>
		</div>
	);
};

export default SettingsTab;
