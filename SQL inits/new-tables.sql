CREATE TABLE HelpRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT,
    status ENUM('Open', 'Closed', 'Pending') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES Users(user_id)
);



CREATE TABLE Responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    message TEXT,
    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES HelpRequests(request_id),
    FOREIGN KEY (volunteer_id) REFERENCES Users(user_id)
);


CREATE TABLE Messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    message_type ENUM('Mass', 'Direct') DEFAULT 'Direct',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id)
);


CREATE TABLE MessageRecipients (
    message_id INT,
    recipient_id INT,
    status ENUM('Read', 'Unread') DEFAULT 'Unread',
    PRIMARY KEY (message_id, recipient_id),
    FOREIGN KEY (message_id) REFERENCES Messages(message_id),
    FOREIGN KEY (recipient_id) REFERENCES Users(user_id)
);
