import { useState, useEffect } from "react";
import api from "../api";
import { data } from "react-router-dom";
import Event from "../components/Event";
import "../styles/Home.css";
import "../styles/Event.css";




function Home() {
  const [event, setEvent] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");


  useEffect(() => {
    getEvents();
  }, []);

  const getEvents = () => {
    api
      .get("/api/event/")
      .then((res) => res.data)
      .then((data) => {
        setEvent(data);
        console.log(data);
      })
      .catch((error) => alert(error));
  };

  const deleteEvent = (id) => {
    api
      .delete(`/api/event/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) alert("Event deleted");
        else alert("Error deleting event");
      })
      .catch((error) => alert(error));
    getEvents();
  };
  const createEvent = (e) => {
    e.preventDefault();
    api
      .post("/api/event/", { title, description, location })
      .then((res) => {
        if (res.status === 201) alert("Event created");
        else alert("Error creating event");
      })
      .catch((error) => alert(error));
    getEvents();
  };

  return (
    <div>
      <div>
        <h2>Events</h2>
            {event.map((event) => (
                 <Event event={event} onDelete={deleteEvent} key={event.id} />
            ))}
        
      </div>
      <h2>Create Event</h2>
      <form onSubmit={createEvent}>
        <label htmlFor="title">Title:</label>
        <br />
        <input
          type="text"
          id="title"
          name="title"
          required
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <br />
        <label htmlFor="description">Description:</label>
        <br />
        <textarea
          id="description"
          name="description"
          required
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        ></textarea>
        <br />
        <label htmlFor="location">Location:</label>
        <br />
        <input
          type="text"
          id="location"
          name="location"
          required
          onChange={(e) => setLocation(e.target.value)}
          value={location}
        />  
        <br />

        <br />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default Home;
