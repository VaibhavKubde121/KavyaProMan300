import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function CustomizeOrganization() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const { orgName, slug, desc } = location.state || {};

  return (
    <div className="org-page">
      <div className="org-container">

       
        <div className="org-back" onClick={() => navigate("/create")}>
          ← Back to Organizations
        </div>

    
        <h2 className="org-title">Create Organization</h2>
        <p className="org-subtitle">
          Set up your workspace in just a few steps
        </p>

        <div className="org-steps">
          <span className="org-step done">✓ Basic Info</span>
          <span className="org-step active">2 Customize</span>
        </div>


        <div className="org-card">

          <h3>Customize Your Workspace</h3>
          <p className="org-subtitle">
            Add a logo and complete your setup
          </p>

         
          <label>Organization Logo</label>
          <div className="upload-box">
            <p>⬆ Click to upload or drag and drop</p>
            <span>SVG, PNG, JPG (max 2MB)</span>
          </div>

      
          <div className="org-next">
            <h4>What's Next?</h4>
            <ul>
              <li>Invite team members to your organization</li>
              <li>Create your first project</li>
              <li>Set up workflows and customize settings</li>
              <li>Start tracking issues and sprints</li>
            </ul>
          </div>

  
          <div className="org-summary">
            <h4>Summary</h4>

            <div className="summary-row">
              <span>Name:</span>
              <b>{orgName}</b>
            </div>

            <div className="summary-row">
              <span>URL:</span>
              <b>kavyaproman.com/{slug}</b>
            </div>

            <div className="summary-row">
              <span>Description:</span>
              <b>{desc}</b>
            </div>
          </div>

          <div className="org-buttons">
            <button
              className="org-cancel"
              onClick={() => navigate("/create")}
            >
              ← Back
            </button>

            <button
              className="org-continue"
              onClick={() => alert("Organization Created!")}
            >
              ✓ Create Organization
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CustomizeOrganization;