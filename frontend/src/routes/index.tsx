import { createFileRoute } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import {getRooms} from "~/fetch/room";
export const Route = createFileRoute("/")({
	component: Home,
})

function Home() {
	const { isFetching, data, error } = useQuery({
		queryKey: ["landingPage"],
		queryFn: getRooms,
	})

	if (isFetching) {
		return <div>Loading...</div>
	}

	return (
		<div className="p-2">
			<h1>Dorm management</h1>
			<Button>Click me</Button>
			<div>{
				data && (data.map((room) => <div>
					{room.Status}
					{room.RoomID}
					{room.RoomNumber}
					{room.RoomTypeID}
					{room.MaxOccupancy}
				</div>))
			}</div>
		</div>
	)
}
