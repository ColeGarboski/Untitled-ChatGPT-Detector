import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { storage } from "/src/firebase";
import { ref, uploadBytes } from "firebase/storage";
import axios from "axios";

function Assignment() {
  const [username, setUsername] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const assignment = state?.assignment;
  const [teacherName, setTeacherName] = useState("");

  const userId = useSelector((state) => state.auth.userId);
  const userRole = useSelector((state) => state.auth.role);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(
        db,
        `${userRole === "teacher" ? "Teachers" : "Students"}/${userId}`
      );
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      } else {
        console.error("No such document!");
      }
    };

    const fetchTeacherName = async () => {
      if (assignment) {
        const classRef = doc(db, `Classes/${assignment.classId}`);
        const classSnap = await getDoc(classRef);
        if (classSnap.exists() && classSnap.data().teacherId) {
          const teacherRef = doc(db, `Teachers/${classSnap.data().teacherId}`);
          const teacherSnap = await getDoc(teacherRef);
          if (teacherSnap.exists()) {
            setTeacherName(teacherSnap.data().username);
          } else {
            console.error("Teacher not found");
          }
        } else {
          console.error("Class not found or teacher ID missing");
        }
      }
    };

    fetchUserData();
    fetchTeacherName();
  }, [db, userId, userRole, assignment]);

  if (!assignment) {
    return <div>Loading or no assignment data...</div>;
  }

  const uploadToFirebase = async (file) => {
    if (!file) {
      console.error("No file selected for upload");
      return;
    }
    if (!assignment.id) {
      console.error("No assignment selected");
      return;
    }

    // Construct the file path in Firebase storage
    const filePath = `files/${assignment.classId}/${assignment.id}/${userId}/${file.name}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      console.log("File uploaded successfully");
      notifyBackend(filePath, file.name);
    } catch (error) {
      console.error("Error uploading file to Firebase:", error);
    }
  };

  const notifyBackend = async (filePath, fileName) => {
    // Define the API endpoint. Adjust the URL to your computer
    const apiUrl = "http://127.0.0.1:5000/analyze-assignment";

    // Prepare the data to send
    const postData = {
      file_path: filePath,
      file_name: fileName,
      classID: assignment.classId,
      studentID: userId,
      assignmentID: assignment.id,
    };

    try {
      const response = await axios.post(apiUrl, postData);
      console.log("Backend notified successfully:", response.data);
    } catch (error) {
      console.error("Error notifying backend:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".docx")) {
      setSelectedFile(file);
    } else {
      alert("Please select a .docx file.");
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith(".docx")) {
      setSelectedFile(file);
    } else {
      alert("Please drop a .docx file.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="App">
      <header>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 h-32">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {username}!
              </h1>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate(-1)}
                className="block rounded-lg px-5 py-3  bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
                type="button"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </header>
      <main style={{ display: "flex", justifyContent: "center" }}>
        <div className="h-96 w-1/2 relative block overflow-hidden rounded-lg border bg-white border-gray-100 p-4 sm:p-6 lg:p-8">
          <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>
          <div className="sm:flex sm:justify-between sm:gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                {assignment.assignmentName}
              </h3>
              <p className="mt-1 text-xs font-medium text-gray-600">
                {teacherName}
              </p>
            </div>
          </div>
          <p
            className="text-pretty text-sm text-gray-500"
            style={{ maxHeight: "100px", overflowY: "auto" }}
          >
            Detailed information about the assignment can go here.
          </p>
          <div className="mt-4 flex flex-col gap-4 justify-center algsm:mt-0 sm:flex-row sm:items-center pt-10">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="block rounded-lg px-10 py-3  bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
            >
              <span className="relative z-10">Submit</span>
            </button>
          </div>
          <dl className="mt-6 flex gap-4 justify-center sm:gap-6">
            <div className="flex flex-col-reverse">
              <dt className="text-sm font-medium text-gray-600">
                {new Date(
                  assignment.endTime.seconds * 1000
                ).toLocaleDateString()}
              </dt>
              <dd className="text-xs text-gray-500">Due</dd>
            </div>
          </dl>
        </div>
      </main>
      {showSubmitModal && (
        <div className="modal" onClick={() => setShowSubmitModal(false)}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div class="flex items-center justify-center w-full">
              <label
                for="dropzone-file"
                class="flex flex-col items-center justify-center w-80 h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">DOCX</p>
                </div>
                <input id="dropzone-file" type="file" class="hidden" />
              </label>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Assignment;
