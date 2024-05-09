// import React, { useState } from 'react';
// import axios from 'axios';

// const CreateIncidentModal = ({ isOpen, onClose }) => {
//     const [incidentType, setIncidentType] = useState('');
//     const [description, setDescription] = useState('');
//     const [status, setStatus] = useState('reported');

//     const handleSubmit = async () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(async (position) => {
//                 const incidentData = {
//                     incident_type: incidentType,
//                     description: description,
//                     location_lat: position.coords.latitude,
//                     location_lng: position.coords.longitude,
//                     status: status
//                 };

//                 try {
//                     const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];
//                     const response = await axios.post('http://localhost:8000/api/create-incident-report', incidentData, {
//                         headers: { Authorization: `Bearer ${authToken}` }
//                     });
//                     console.log('Incident reported successfully:', response.data); 
//                     onClose();
//                 } catch (error) {
//                     console.error('Error creating incident:', error);
//                 }
//             }, (error) => {
//                 console.error("Error obtaining location: " + error.message);
//             });
//         } else {
//             console.error("Geolocation cannot be found.");
//         }
//     };

//     return isOpen ? (
//         <div>
//             <h2>Report New Incident</h2>
//             <input value={incidentType} onChange={e => setIncidentType(e.target.value)} placeholder="Incident Type" />
//             <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
//             <button onClick={handleSubmit}>Submit</button>
//             <button onClick={onClose}>Cancel</button>
//         </div>
//     ) : null;
// };

// export default CreateIncidentModal;



import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/styles.css';


const CreateIncidentModal = ({ isOpen, onClose }) => {
    const [incidentType, setIncidentType] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('reported');

    const handleCancel = () => {
        // Clear form data
        setIncidentType('');
        setDescription('');

        // Close the modal
        onClose();
    };

        const handleSubmit = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const incidentData = {
                    incident_type: incidentType,
                    description: description,
                    location_lat: position.coords.latitude,
                    location_lng: position.coords.longitude,
                    status: status
                };

                try {
                    const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];
                    const response = await axios.post('http://localhost:8000/api/create-incident-report', incidentData, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    console.log('Incident reported successfully:', response.data); 
                    onClose();
                } catch (error) {
                    console.error('Error creating incident:', error);
                }
            }, (error) => {
                console.error("Error obtaining location: " + error.message);
            });
        } else {
            console.error("Geolocation cannot be found.");
        }
    };

    return isOpen ? (
        <div className={isOpen ? "modalshown" : "modalhidden"}>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-content">
                <div className="box">
                    <h2 className="title is-4">Report a New Incident</h2>
                    <div className="field">
                        <label className="label">Incident Type</label>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter incident type"
                                value={incidentType}
                                onChange={(e) => setIncidentType(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Description</label>
                        <div className="control">
                            <textarea
                                className="textarea"
                                placeholder="Describe the incident"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                    <div className="field is-grouped">
                        <div className="control">
                            <button className="button is-primary" onClick={handleSubmit}>Submit</button>
                        </div>
                        <div className="control">
                            <button className="button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={onClose}></button>
        </div>
    ) : null;
};

export default CreateIncidentModal;
