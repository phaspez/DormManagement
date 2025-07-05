import { Link } from "@tanstack/react-router"

export default function Header() {
	return (
		<header className="bg-gray-800/50 text-white p-4 m-4 rounded-xl">
			<div className="container mx-auto flex justify-between items-center">
				<h1 className="text-2xl font-bold">Dorm Management</h1>
				<nav className="flex gap-4">
					<Link
						to="/"
						className="hover:underline"
						activeProps={{
							className: "font-bold",
						}}
					>
						Home
					</Link>
					<Link
						to="/room"
						className="hover:underline"
						activeProps={{
							className: "font-bold",
						}}
					>
						Rooms Management
					</Link>
					<Link
						to="/"
						className="hover:underline"
						activeProps={{
							className: "font-bold",
						}}
					>
						About
					</Link>
				</nav>
			</div>
		</header>
	)
}
