import { Link } from "react-router-dom";
import "../styles/EmployeeShiftsTable.css";

export default function EmployeeShiftsTable({ shifts, viewMode }) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL");
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "-";
    
    const [startHour, startMin] = startTime.split(":").map(Number);
    let [endHour, endMin] = endTime.split(":").map(Number);
    
    // If end time is smaller than start time, it means next day
    if (endHour < startHour || (endHour === startHour && endMin < startMin)) {
      endHour += 24;
    }
    
    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return minutes > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${hours}:00`;
  };


  if (shifts.length === 0) {
    return (
      <div className="no-results">
        {viewMode === "wage" ? "לא נמצאו משמרות" : "לא נמצאו משמרות מתוכננות"}
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="global-table">
          <thead>
            <tr>
              <th>אירוע</th>
              <th>תאריך</th>
              <th>כתובת</th>
              <th>התחלה</th>
              <th>סיום</th>
              <th>משך</th>
              {viewMode === "wage" && (
                <>
                  <th>שכר</th>
                  <th>טיפ</th>
                  <th>שולם</th>
                </>
              )}
              <th>הערות</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>
                  {shift.event ? (
                    <Link 
                      to={`/events/${shift.event._id}`}
                      className="employee-shifts-table__link"
                    >
                      {shift.event.eventNumber || "לקוח לא ידוע"}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{formatDate(shift.event?.eventDate)}</td>
                <td>{shift.event?.address || "-"}</td>
                <td>{shift.startTime || "-"}</td>
                <td>{shift.endTime || "-"}</td>
                <td>{calculateDuration(shift.startTime, shift.endTime)}</td>
                {viewMode === "wage" && (
                  <>
                    <td>₪{shift.wage?.toLocaleString() || "0"}</td>
                    <td>₪{shift.tip?.toLocaleString() || "0"}</td>
                    <td>{shift.paid ? "✓" : "✗"}</td>
                  </>
                )}
                <td>{shift.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}