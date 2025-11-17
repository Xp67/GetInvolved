import React from "react";
import "../styles/Event.css";


function Event({ event, onDelete }) {
    const formattedDate = new Date(event.created_at).toLocaleDateString("it-IT");

    return (
        <div className="event-container">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-content">{event.description}</p>
        <p className="event-content">{event.location}</p>
        <p className="event-content">{formattedDate}</p>
        <button className="delete-button" onClick={() => onDelete(Event.id)}>
            Delete
        </button>
    </div>
);
}

export default Event;