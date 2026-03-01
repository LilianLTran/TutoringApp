// import { TutoringRequest } from "@/app/dashboard/page"

// type Props = {
//   request: TutoringRequest
// }

// export default function RequestCard({ request }: Props) {
//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-md">
//       <h3 className="text-lg font-semibold">
//         {request.course}
//       </h3>

//       <p className="text-sm text-gray-500 mb-2">
//         {new Date(request.dateRequest).toLocaleDateString("en-US")} at {request.timeRequest}
//       </p>

//       <p className="mb-4">
//         {request.errorType}
//       </p>

//       <div className="text-xs text-gray-400 flex justify-between">
//         <span>{request.createdBy}</span>
//         <span>
//           {new Date(request.createdAt).toLocaleString()}
//         </span>
//       </div>
//     </div>
//   )
// }