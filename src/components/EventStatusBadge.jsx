

import TableDropDownActionMenu from "./TableDropDownActionMenu";

const EventStatusBadge = ({ status, statusOptions = [], onStatusChange = null }) => {
  const getStatusConfig = (statusCode) => {
    switch (statusCode) {
      case "LOST":
        return {
          backgroundColor: "#000000",
          text: "אירוע נפל",
          icon: "💀",
        };
      case "NOT_CLOSED":
        return {
          backgroundColor: "#F59E0B",
          glowColor: "rgba(245, 158, 11, 0.6)",
          text: "לא נסגר",
          icon: "⚠️",
        };
      case "CLOSED":
        return {
          backgroundColor: "#10B981",
          glowColor: "rgba(16, 185, 129, 0.8)",
          text: "נסגר",
          icon: "🔒",
        };
      case "DONE":
        return {
          backgroundColor: "#047857",
          glowColor: "rgba(4, 120, 87, 0.6)",
          text: "בוצע",
          icon: "✓",
        };
      default:
        return {
          backgroundColor: "#3B82F6",
          glowColor: "rgba(59, 130, 246, 0.5)",
          text: status?.label || "לא ידוע",
          icon: "●",
        };
    }
  };

  const config = getStatusConfig(status?.code);

  const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "25px",
    backgroundColor: config.backgroundColor,
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
   
    border: "2px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
    animation: "pulse 2s infinite",
  };

  const iconStyle = {
    fontSize: "20px",
    display: "inline-block",
  };

  // If we have status options and an onChange handler, make it interactive
  if (statusOptions.length > 0 && onStatusChange) {
    const formattedOptions = statusOptions
      .filter(s => s.code !== status?.code) // Don't show current status in options
      .map(s => ({
        value: s.code,
        label: s.label,
      }));

    return (
      <>
        <style>
          {`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.85;
              }
            }
          `}
        </style>
        <TableDropDownActionMenu
          status={
            <div style={badgeStyle}>
              <span style={iconStyle}>{config.icon}</span>
              <span>{config.text}</span>
            </div>
          }
          statusValue={status?.code}
          statusOptions={formattedOptions}
          onStatusChange={onStatusChange}
        />
      </>
    );
  }

  // Default non-interactive badge
  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.85;
            }
          }
        `}
      </style>
      <div style={badgeStyle}>
        <span style={iconStyle}>{config.icon}</span>
        <span>{config.text}</span>
      </div>
    </>
  );
};

export default EventStatusBadge;
