import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import useRoleRedirect from '../hooks/useRoleRedirect';
import '/src/ClassTeacherPage.css';

function TeacherPage() {
    useRoleRedirect('teacher');

    const [data, setData] = useState([]);
    const [showCreateClassModal, setShowCreateClassModal] = useState(false);
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);

    const teacherId = useSelector((state) => state.auth.userId);
    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(db, "someCollection"), where("role", "==", "teacher"));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
            setData(items);
        };

        fetchData();
    }, [db]);

    const closeModal = () => {
        setShowCreateClassModal(false);
        setShowCreateAssignmentModal(false);
        setShowAddStudentModal(false);
    };

    const createClass = async (classData) => {
        try {
            const classRef = doc(collection(db, `Users/${teacherId}/Classes`));
            await setDoc(classRef, classData);
            console.log("Class created with ID: ", classRef.id);
            closeModal();
        } catch (error) {
            console.error("Error creating class: ", error);
        }
    };

    const createAssignment = async (classId, assignmentData) => {
        try {
            const assignmentRef = doc(collection(db, `Users/${teacherId}/Classes/${classId}/Assignments`));
            await setDoc(assignmentRef, assignmentData);
            console.log("Assignment created with ID: ", assignmentRef.id);
            closeModal();
        } catch (error) {
            console.error("Error creating assignment: ", error);
        }
    };

    const addStudentToClass = async (classId, studentId) => {
        try {
            const studentRef = doc(db, `Users/${teacherId}/Classes/${classId}/Students/${studentId}`);
            await setDoc(studentRef, { added: true });
            console.log(`Student ${studentId} added to class ${classId}`);
            closeModal();
        } catch (error) {
            console.error("Error adding student to class: ", error);
        }
    };

    return (
        <div className="App">
            <header className="navbar-logo-left">
                <div className="navbar-logo-left-container shadow-three">
                    <div className="container">
                        <div className="navbar-wrapper">
                            <a href="#" className="navbar-brand">
                                <div className="text-block">TR<em>AI</em>TOR</div>
                            </a>
                            <nav className="nav-menu-wrapper">
                                <ul className="nav-menu-two">
                                    <li><a href="#" className="nav-link">Classes</a></li>
                                    <li><a href="#" className="nav-link">Upcoming Assignments</a></li>
                                    <li><a href="#" className="nav-link">Previous Scores</a></li>
                                    <li><div className="nav-divider"></div></li>
                                    <li className="mobile-margin-top-10">
                                        <button onClick={() => setShowCreateClassModal(true)} className="button-primary">Create class</button>
                                    </li>
                                    <li className="mobile-margin-top-10">
                                        <button onClick={() => setShowCreateAssignmentModal(true)} className="button-primary">Create assignment</button>
                                    </li>
                                    <li className="mobile-margin-top-10">
                                        <button onClick={() => setShowAddStudentModal(true)} className="button-primary">Add student</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <div className="grid">
                    {data.map((item, index) => (
                        <div key={index} className="div-block">
                            <div className="div-block-2">
                                <img src={item.imageURL || '/src/assets/classy.jpg'} loading="lazy" alt="" className="image"/>
                            </div>
                            <div className="text-block-4">{item.classCode}</div>
                            <div className="div-block-3">
                                <div className="text-block-5">{item.schedule}</div>
                                <div className="text-block-6">{item.instructor}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {showCreateClassModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Create Class Form</h2>
                        <form onSubmit={e => { e.preventDefault(); createClass({/* formData */}); }}>
                            <div className="form-group">
                                <label htmlFor="classCode">Class Code</label>
                                <input type="text" id="classCode" name="classCode" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="className">Class Name</label>
                                <input type="text" id="className" name="className" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="startTime">Start Time</label>
                                <input type="time" id="startTime" name="startTime" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="endTime">End Time</label>
                                <input type="time" id="endTime" name="endTime" required />
                            </div>
                            <button type="submit" className="submit-button">Create Class</button>
                        </form>
                    </div>
                </div>
            )}

            {showCreateAssignmentModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Create Class Form</h2>
                        <form onSubmit={e => { e.preventDefault(); createClass({/* formData */}); }}>
                            <div className="form-group">
                                <label htmlFor="classCode">Class Code</label>
                                <input type="text" id="classCode" name="classCode" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="className">Assignment Name</label>
                                <input type="text" id="className" name="className" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="endTime">End Time</label>
                                <input type="time" id="endTime" name="endTime" required />
                            </div>
                            <button type="submit" className="submit-button">Create Assignment</button>
                        </form>
                    </div>
                </div>
            )}

            {showAddStudentModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Add Student Form</h2>
                        {/* Implement the form here */}
                        <button onClick={() => addStudentToClass("classIdHere", "studentIdHere")}>Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherPage;
