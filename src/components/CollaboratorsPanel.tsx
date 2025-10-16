import { useState } from "react";
import type { Collaborator } from "../types/Collaborator";
import "../styles/CollaboratorsPanel.css";

interface CollaboratorsPanelProps {
    collaborators: Collaborator[];
    onCollaboratorsChange: (collaborators: Collaborator[]) => void;
}

export function CollaboratorsPanel({ collaborators, onCollaboratorsChange }: CollaboratorsPanelProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const handleAddCollaborator = () => {
        if (name.trim() && email.trim()) {
            const newCollaborator: Collaborator = {
                name: name.trim(),
                email: email.trim(),
                role: role.trim() || undefined,
            };
            onCollaboratorsChange([...collaborators, newCollaborator]);
            setName("");
            setEmail("");
            setRole("");
        }
    };

    const handleRemoveCollaborator = (index: number) => {
        onCollaboratorsChange(collaborators.filter((_, i) => i !== index));
    };

    return (
        <div className="collaborators-panel" data-testid="collaborators-panel">
            <h3>Collaborators</h3>
            <p className="panel-description">List everyone who worked with you on this assignment.</p>
            
            <div className="collaborators-list">
                {collaborators.length === 0 ? (
                    <p className="no-collaborators">No collaborators added yet.</p>
                ) : (
                    <ul>
                        {collaborators.map((collaborator, index) => (
                            <li key={index} className="collaborator-item" data-testid={`collaborator-${index}`}>
                                <div className="collaborator-info">
                                    <span className="collaborator-name">{collaborator.name}</span>
                                    <span className="collaborator-email">{collaborator.email}</span>
                                    {collaborator.role && (
                                        <span className="collaborator-role">Role: {collaborator.role}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRemoveCollaborator(index)}
                                    className="remove-button"
                                    data-testid={`remove-collaborator-${index}`}
                                    type="button"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="add-collaborator-form">
                <h4>Add Collaborator</h4>
                <div className="form-row">
                    <input
                        type="text"
                        placeholder="Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="collaborator-input"
                        data-testid="collaborator-name-input"
                    />
                    <input
                        type="email"
                        placeholder="Email *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="collaborator-input"
                        data-testid="collaborator-email-input"
                    />
                    <input
                        type="text"
                        placeholder="Role (optional)"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="collaborator-input"
                        data-testid="collaborator-role-input"
                    />
                    <button
                        onClick={handleAddCollaborator}
                        disabled={!name.trim() || !email.trim()}
                        className="add-button"
                        data-testid="add-collaborator-button"
                        type="button"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
