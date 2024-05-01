import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/styles.css';

const CreatePostModal = ({ isOpen, onClose, onCreatePost }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const handleCancel = () => {
        // Clear title and body
        setTitle('');
        setBody('');

        // Close the modal
        onClose();
    }

    const handlePost = () => {
        // Assuming title and body are state variables
        const postInfo = {
            title: title,
            body: body
        };
        const authToken = document.cookie && document.cookie.split('; ')
            .find(row => row.startsWith('authToken=')).split('=')[1];
        // Make the axios POST request
        axios.post('http://localhost:5000/api/createpost', postInfo, {
            headers: {
                Authorization: authToken
            }
        })
            .then(response => {
                // Handle success
                console.log('Post created successfully');
                // Close the modal or perform any other actions upon successful creation
                onClose();
            })
            .catch(error => {
                // Handle error
                console.error('Error creating post:', error);
                // You can optionally display an error message to the user
            });
    };

    return (
        <div className={isOpen ? "modalshown" : "modalhidden"}>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-content">
                <div className="box">
                    <h2 className="title is-4">Create a New Post</h2>
                    <div className="field">
                        <label className="label">Title</label>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Body</label>
                        <div className="control">
                            <textarea
                                className="textarea"
                                placeholder="Enter body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                    <div className="field is-grouped">
                        <div className="control">
                            <button className="button is-primary" onClick={handlePost}>Post</button>
                        </div>
                        <div className="control">
                            <button className="button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={onClose}></button>
        </div>
    );
};

export default CreatePostModal;