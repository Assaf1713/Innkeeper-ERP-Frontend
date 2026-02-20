import React, { useState, useEffect, useRef } from "react";
import "../styles/TableDropDownActionMenu.css"; // Import the separate CSS file
import { useAlert } from "../hooks/useAlert";

const TableDropDownActionMenu = ({
  phone = "",
  email = "",
  name = "",
  status = "",
  statusValue = "",
  statusOptions = [],
  onStatusChange = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { showSuccess } = useAlert();

  // Close the menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (!phone && !email) return;
    if (phone) {
      navigator.clipboard.writeText(phone);
      setIsOpen(false);
    }
    if (email) {
      navigator.clipboard.writeText(email);
      setIsOpen(false);
    }

    showSuccess("הפרטים הועתקו ללוח!");
  };

  const handleWhatsApp = () => {
    if (!phone) return;

    // Construct the personalized message
    const message = `שלום ${name || ""} !
אני אסף מאינקיפר שירותי בר וקוקטיילים ראיתי שהשארת לנו פנייה באתר לגבי אירוע :)
רוצה לספר לי קצת פרטים? על מה מדובר? מה הגילאים?`;

    // Encode the message for URL safety
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp Web/App
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(url, "_blank");

    setIsOpen(false);
  };

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsOpen(false);
  };

  // Render a placeholder if no data exists
  if (!phone && !email && !statusValue) return <span>-</span>;

  // Status mode rendering
  if (statusValue && statusOptions.length > 0) {
    return (
      <div className="phone-menu-container" ref={menuRef}>
        <span
          className="phone-number-trigger"
          onClick={() => setIsOpen(!isOpen)}
          title="שנה סטטוס"
        >
          {status}
        </span>

        {/* Status Dropdown Menu for leads that are not lost */}
        {isOpen && statusValue !== "Lost" && (
          <div className="phone-dropdown">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className="phone-menu-item"
                onClick={() => handleStatusChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        {/* If the lead is lost, show a restore option */}
        {isOpen && statusValue === "Lost" && (
          <div className="phone-dropdown">
            <button
              className="phone-menu-item"
              onClick={() => handleStatusChange("New")}
              type="button"
            >
              שחזר
            </button>

            <button
              className="phone-menu-item"
              onClick={() => handleStatusChange("deleteLead")}
              type="button"
            >
              מחק
            </button>
          </div>
        )}
      </div>
    );
  }

  // Phone/Email mode rendering
  return (
    <div className="phone-menu-container" ref={menuRef}>
      {phone && (
        <span
          className="phone-number-trigger"
          onClick={() => setIsOpen(!isOpen)}
          title="העתק ללוח"
        >
          {phone}
        </span>
      )}
      {email && (
        <span
          className="phone-number-trigger"
          onClick={() => setIsOpen(!isOpen)}
          title={
            statusValue !== "Lost"
              ? "העתק ללוח"
              : "ליד לא פעיל, ניתן לשחזר על ידי לחיצה על הסטטוס"
          }
        >
          {email}
        </span>
      )}

      {/* The Dropdown Menu */}
      {isOpen && statusValue !== "Lost" && (
        <div className="phone-dropdown">
          <button
            className="phone-menu-item"
            onClick={handleCopy}
            type="button"
          >
            העתק ללוח
          </button>

          {phone && statusValue !== "Lost" && (
            <button
              className="phone-menu-item"
              onClick={handleWhatsApp}
              type="button"
            >
              שלח הודעת וואטסאפ
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TableDropDownActionMenu;
