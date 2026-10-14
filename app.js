
"use strict";

// ----------------------------------
// 1. SAMPLE HOSPITAL DATA
// ----------------------------------

let patients = [
  { id: 1, name: "Aarav Kumar", age: 32, gender: "Male", phone: "9000000001", blood: "O+" },
  { id: 2, name: "Priya Sharma", age: 26, gender: "Female", phone: "9000000002", blood: "B+" },
  { id: 3, name: "Rahul Reddy", age: 45, gender: "Male", phone: "9000000003", blood: "A+" }
];

const doctors = [
  { id: 1, name: "Dr. Ananya Rao", speciality: "Cardiologist", experience: "10 years", symbol: "♡" },
  { id: 2, name: "Dr. Arjun Mehta", speciality: "Neurologist", experience: "8 years", symbol: "✚" },
  { id: 3, name: "Dr. Sneha Iyer", speciality: "Pediatrician", experience: "6 years", symbol: "♙" }
];

let appointments = [
  { id: 1, patientId: 1, doctorId: 1, date: "2026-10-15", time: "10:00", status: "Scheduled" },
  { id: 2, patientId: 2, doctorId: 3, date: "2026-10-16", time: "11:30", status: "Scheduled" }
];

let bills = [
  { id: 1, patientId: 1, description: "Consultation", date: "2026-10-10", amount: 1500 },
  { id: 2, patientId: 2, description: "Health checkup", date: "2026-10-11", amount: 1000 }
];

let nextPatientId = 4;
let nextAppointmentId = 3;
let nextBillId = 3;
let dialogMode = "";
let transferTimer = null;
let toastTimer = null;

// ----------------------------------
// 2. HELPER FUNCTIONS
// ----------------------------------

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function money(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function getPatient(id) {
  return patients.find(patient => patient.id === Number(id));
}

function getDoctor(id) {
  return doctors.find(doctor => doctor.id === Number(id));
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2600);
}

// ----------------------------------
// 3. NAVIGATION
// ----------------------------------

function showPage(pageName) {
  const page = $(pageName);
  if (!page) return;

  document.querySelectorAll(".page").forEach(section => {
    section.classList.toggle("active", section.id === pageName);
  });

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  $("pageTitle").textContent =
    pageName === "lifi"
      ? "Li-Fi Data Transmission"
      : pageName.charAt(0).toUpperCase() + pageName.slice(1);

  $("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.go));
});

$("menuButton").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

// ----------------------------------
// 4. DASHBOARD
// ----------------------------------

function renderDashboard() {
  $("patientCount").textContent = patients.length;
  $("doctorCount").textContent = doctors.length;
  $("appointmentCount").textContent = appointments.length;

  $("revenue").textContent = money(
    bills.reduce((total, bill) => total + Number(bill.amount), 0)
  );

  const recent = [...appointments]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  $("recentAppointments").innerHTML = recent.length
    ? recent.map(appointment => {
        const patient = getPatient(appointment.patientId);
        const doctor = getDoctor(appointment.doctorId);

        return `
          <div class="recent-row" style="padding:13px 0;border-bottom:1px solid #263951">
            <strong>${escapeHTML(patient?.name || "Deleted patient")}</strong>
            <span style="float:right;color:#8da2bb;font-size:12px">
              ${escapeHTML(appointment.date)}
            </span>
            <span class="subtext">${escapeHTML(doctor?.name || "Doctor unavailable")} ·
              ${escapeHTML(appointment.time)} ·
              ${escapeHTML(appointment.status)}
            </span>
          </div>
        `;
      }).join("")
    : '<p class="empty-state">No appointments booked yet.</p>';
}

// ----------------------------------
// 5. PATIENT MANAGEMENT
// ----------------------------------

function renderPatients() {
  const search = $("patientSearch").value.toLowerCase().trim();

  const filtered = patients.filter(patient =>
    patient.name.toLowerCase().includes(search) ||
    patient.phone.includes(search)
  );

  $("patientRows").innerHTML = filtered.length
    ? filtered.map(patient => `
        <tr>
          <td><span class="person-name">${escapeHTML(patient.name)}</span>
            <span class="subtext">ID: P-${patient.id}</span>
          </td>
          <td>${patient.age}</td>
          <td>${escapeHTML(patient.gender)}</td>
          <td>${escapeHTML(patient.phone)}</td>
          <td><span class="status-pill">${escapeHTML(patient.blood)}</span></td>
          <td><button class="action-button delete-button" data-delete-patient="${patient.id}">Delete</button></td>
        </tr>
      `).join("")
    : '<tr><td colspan="6" class="empty-state">No matching patients found.</td></tr>';
}

$("patientSearch").addEventListener("input", renderPatients);

$("patientRows").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-patient]");
  if (!button) return;

  const id = Number(button.dataset.deletePatient);

  if (!confirm("Delete this sample patient and related appointments and bills?")) return;

  patients = patients.filter(patient => patient.id !== id);
  appointments = appointments.filter(item => item.patientId !== id);
  bills = bills.filter(bill => bill.patientId !== id);

  renderAll();
  showToast("Patient record deleted.");
});

// ----------------------------------
// 6. DOCTOR DIRECTORY
// ----------------------------------

function renderDoctors() {
  $("doctorCards").innerHTML = doctors.map(doctor => `
    <article class="card doctor-card">
      <div class="doctor-avatar">${escapeHTML(doctor.symbol)}</div>
      <h2>${escapeHTML(doctor.name)}</h2>
      <p>${escapeHTML(doctor.speciality)}</p>
      <p>${escapeHTML(doctor.experience)} experience</p>
      <button class="primary" data-book-doctor="${doctor.id}">Book Appointment</button>
    </article>
  `).join("");
}

$("doctorCards").addEventListener("click", event => {
  const button = event.target.closest("[data-book-doctor]");
  if (!button) return;

  openAppointmentForm(Number(button.dataset.bookDoctor));
});

// ----------------------------------
// 7. APPOINTMENT MANAGEMENT
// ----------------------------------

function renderAppointments() {
  const search = $("appointmentSearch").value.toLowerCase().trim();

  const filtered = appointments.filter(appointment => {
    const patient = getPatient(appointment.patientId);
    const doctor = getDoctor(appointment.doctorId);

    return (
      (patient?.name || "").toLowerCase().includes(search) ||
      (doctor?.name || "").toLowerCase().includes(search)
    );
  });

  $("appointmentRows").innerHTML = filtered.length
    ? filtered.map(appointment => {
        const patient = getPatient(appointment.patientId);
        const doctor = getDoctor(appointment.doctorId);

        return `
          <tr>
            <td>${escapeHTML(patient?.name || "Deleted patient")}</td>
            <td>${escapeHTML(doctor?.name || "Unknown doctor")}</td>
            <td>${escapeHTML(appointment.date)}</td>
            <td>${escapeHTML(appointment.time)}</td>
            <td><span class="status-pill ${escapeHTML(appointment.status)}">
              ${escapeHTML(appointment.status)}
            </span></td>
            <td>
              ${appointment.status === "Scheduled" ? `
                <button class="action-button" data-complete="${appointment.id}">Complete</button>
                <button class="action-button delete-button" data-cancel="${appointment.id}">Cancel</button>
              ` : "—"}
            </td>
          </tr>
        `;
      }).join("")
    : '<tr><td colspan="6" class="empty-state">No appointments found.</td></tr>';
}

$("appointmentSearch").addEventListener("input", renderAppointments);

$("appointmentRows").addEventListener("click", event => {
  const completeButton = event.target.closest("[data-complete]");
  const cancelButton = event.target.closest("[data-cancel]");

  if (completeButton) {
    const item = appointments.find(
      appointment => appointment.id === Number(completeButton.dataset.complete)
    );
    if (item) item.status = "Completed";
    renderAll();
    showToast("Appointment marked completed.");
  }

  if (cancelButton) {
    const item = appointments.find(
      appointment => appointment.id === Number(cancelButton.dataset.cancel)
    );
    if (item) item.status = "Cancelled";
    renderAll();
    showToast("Appointment cancelled.");
  }
});

// ----------------------------------
// 8. BILLING MANAGEMENT
// ----------------------------------

function renderBills() {
  $("billRows").innerHTML = bills.length
    ? bills.map(bill => {
        const patient = getPatient(bill.patientId);

        return `
          <tr>
            <td>INV-${String(bill.id).padStart(3, "0")}</td>
            <td>${escapeHTML(patient?.name || "Deleted patient")}</td>
            <td>${escapeHTML(bill.description)}</td>
            <td>${escapeHTML(bill.date)}</td>
            <td><strong>${money(bill.amount)}</strong></td>
            <td><button class="action-button" data-print="${bill.id}">Print</button></td>
          </tr>
        `;
      }).join("")
    : '<tr><td colspan="6" class="empty-state">No bills created yet.</td></tr>';
}

$("billRows").addEventListener("click", event => {
  const button = event.target.closest("[data-print]");
  if (!button) return;

  const bill = bills.find(item => item.id === Number(button.dataset.print));
  if (!bill) return;

  const patient = getPatient(bill.patientId);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Allow pop-ups to print the sample bill.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Sample Invoice</title>
    <style>body{font-family:Arial;padding:35px}h1{color:#164c79}hr{margin:25px 0}</style>
    </head>
    <body>
      <h1>MediLink Hospital</h1>
      <h2>Sample Invoice INV-${String(bill.id).padStart(3, "0")}</h2>
      <hr>
      <p>Patient: ${escapeHTML(patient?.name || "Deleted patient")}</p>
      <p>Description: ${escapeHTML(bill.description)}</p>
      <p>Date: ${escapeHTML(bill.date)}</p>
      <h2>Total: ${money(bill.amount)}</h2>
      <p>Academic demonstration only.</p>
      <script>window.onload=()=>window.print();<\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
});

// ----------------------------------
// 9. REUSABLE FORM SYSTEM
// ----------------------------------

function openForm(title, mode, fields) {
  dialogMode = mode;
  $("modalTitle").textContent = title;

  $("modalFields").innerHTML = fields.map(field => {
    const options = field.options
      ? field.options.map(option => `
          <option value="${escapeHTML(option.value)}">
            ${escapeHTML(option.label)}
          </option>
        `).join("")
      : "";

    const input = field.type === "select"
      ? `<select id="field-${field.name}" name="${field.name}" required>${options}</select>`
      : `<input id="field-${field.name}" name="${field.name}"
          type="${field.type || "text"}"
          ${field.min !== undefined ? `min="${field.min}"` : ""}
          ${field.max !== undefined ? `max="${field.max}"` : ""}
          ${field.step ? `step="${field.step}"` : ""}
          ${field.maxlength ? `maxlength="${field.maxlength}"` : ""}
          required>`;

    return `
      <div class="field ${field.full ? "full-field" : ""}">
        <label for="field-${field.name}">${escapeHTML(field.label)}</label>
        ${input}
      </div>
    `;
  }).join("");

  // Set safe initial values after building the form.
  fields.forEach(field => {
    const element = $("field-" + field.name);
    if (element && field.value !== undefined) element.value = field.value;
  });

  $("recordDialog").showModal();
}

function closeForm() {
  $("recordDialog").close();
  dialogMode = "";
}

$("closeModal").addEventListener("click", closeForm);
$("cancelModal").addEventListener("click", closeForm);

$("recordDialog").addEventListener("click", event => {
  if (event.target === $("recordDialog")) closeForm();
});

function openAppointmentForm(doctorId = null) {
  if (!patients.length) {
    showToast("Add a patient before booking an appointment.");
    showPage("patients");
    return;
  }

  openForm("Book Appointment", "appointment", [
    {
      name: "patientId", label: "Patient", type: "select",
      options: patients.map(p => ({
        value: p.id, label: p.name
      })),
      value: patients[0].id
    },
    {
      name: "doctorId", label: "Doctor", type: "select",
      options: doctors.map(d => ({
        value: d.id, label: `${d.name} — ${d.speciality}`
      })),
      value: doctorId || doctors[0].id
    },
    { name: "date", label: "Appointment Date", type: "date", value: new Date().toISOString().slice(0, 10) },
    { name: "time", label: "Appointment Time", type: "time", value: "10:00" }
  ]);

  $("field-date").min = new Date().toISOString().slice(0, 10);
}

$("addPatient").addEventListener("click", () => {
  openForm("Register Patient", "patient", [
    { name: "name", label: "Full Name", maxlength: 70, full: true },
    { name: "age", label: "Age", type: "number", min: 1, max: 120 },
    {
      name: "gender", label: "Gender", type: "select",
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" }
      ]
    },
    { name: "phone", label: "Phone Number", type: "tel", maxlength: 10 },
    {
      name: "blood", label: "Blood Group", type: "select",
      options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        .map(group => ({ value: group, label: group }))
    }
  ]);
});

$("addAppointment").addEventListener("click", () => openAppointmentForm());

$("addBill").addEventListener("click", () => {
  if (!patients.length) {
    showToast("Add a patient before creating a bill.");
    showPage("patients");
    return;
  }

  openForm("Create Hospital Bill", "bill", [
    {
      name: "patientId", label: "Patient", type: "select",
      options: patients.map(p => ({ value: p.id, label: p.name }))
    },
    { name: "description", label: "Description", maxlength: 100, full: true },
    { name: "date", label: "Bill Date", type: "date", value: new Date().toISOString().slice(0, 10) },
    { name: "amount", label: "Amount (₹)", type: "number", min: 1, max: 10000000, step: "0.01" }
  ]);
});

$("recordForm").addEventListener("submit", event => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);
  const value = name => String(form.get(name) || "").trim();

  if (dialogMode === "patient") {
    const name = value("name");
    const age = Number(value("age"));
    const phone = value("phone");

    if (!name || !Number.isInteger(age) || age < 1 || age > 120) {
      showToast("Enter a valid name and age.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showToast("Enter a 10-digit phone number.");
      return;
    }

    patients.push({
      id: nextPatientId++,
      name,
      age,
      gender: value("gender"),
      phone,
      blood: value("blood")
    });

    showToast("Patient registered successfully.");
  }

  if (dialogMode === "appointment") {
    const patientId = Number(value("patientId"));
    const doctorId = Number(value("doctorId"));
    const date = value("date");
    const time = value("time");

    if (!getPatient(patientId) || !getDoctor(doctorId) || !date || !time) {
      showToast("Please complete all appointment fields.");
      return;
    }

    if (date < new Date().toISOString().slice(0, 10)) {
      showToast("Choose today or a future date.");
      return;
    }

    appointments.push({
      id: nextAppointmentId++,
      patientId,
      doctorId,
      date,
      time,
      status: "Scheduled"
    });

    showToast("Appointment booked successfully.");
  }

  if (dialogMode === "bill") {
    const patientId = Number(value("patientId"));
    const amount = Number(value("amount"));
    const description = value("description");
    const date = value("date");

    if (!getPatient(patientId) || !description || !date ||
        !Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
      showToast("Enter valid bill details.");
      return;
    }

    bills.push({
      id: nextBillId++,
      patientId,
      description,
      date,
      amount
    });

    showToast("Sample bill created successfully.");
  }

  closeForm();
  renderAll();
});

// ----------------------------------
// 10. Li-Fi SIMULATION
// ----------------------------------

$("message").addEventListener("input", () => {
  $("charCount").textContent = $("message").value.length;
});

function encodeBinary(message) {
  const bytes = new TextEncoder().encode(message);

  return Array.from(bytes)
    .map(byte => byte.toString(2).padStart(8, "0"))
    .join(" ");
}

function stopTransmission() {
  clearInterval(transferTimer);
  transferTimer = null;

  $("led").classList.remove("transmitting");
  $("lightBeam").classList.remove("active");
  $("lightParticle").classList.remove("active");
}

$("transmit").addEventListener("click", () => {
  const message = $("message").value.trim();

  if (!message) {
    showToast("Please enter a message first.");
    return;
  }

  // Prevent multiple simultaneous simulations.
  stopTransmission();

  const binary = encodeBinary(message);
  const bytes = new TextEncoder().encode(message);

  $("binaryOutput").textContent = binary;
  $("bitCount").textContent = `${bytes.length * 8} bits`;

  $("decodedMessage").textContent = "Receiving data...";
  $("receiverStatus").textContent = "Optical signal in progress";
  $("verification").textContent = "TRANSMITTING";
  $("verification").classList.remove("success");

  $("led").classList.add("transmitting");
  $("ledTitle").textContent = "LED transmitting";
  $("ledDescription").textContent = "Simulated light signal is active";

  $("lightBeam").classList.add("active");
  $("lightParticle").classList.add("active");
  $("transferStatus").textContent = "Sending binary data...";
  $("transmit").disabled = true;
  $("transmit").textContent = "Transmitting...";

  let progress = 0;
  $("progress").style.width = "0%";
  $("percent").textContent = "0%";

  transferTimer = setInterval(() => {
    progress = Math.min(progress + 5, 100);

    $("progress").style.width = progress + "%";
    $("percent").textContent = progress + "%";

    if (progress >= 100) {
      stopTransmission();

      $("ledTitle").textContent = "Transmission complete";
      $("ledDescription").textContent = "LED simulation finished";
      $("transferStatus").textContent = "Message delivered";
      $("receiverStatus").textContent = "Simulation completed successfully";
      $("decodedMessage").textContent = message;
      $("verification").textContent = "RECEIVED";
      $("verification").classList.add("success");

      $("transmit").disabled = false;
      $("transmit").textContent = "↻ Transmit Again";

      showToast("Li-Fi simulation completed!");
    }
  }, 65);
});

// ----------------------------------
// 11. INITIALIZE THE APPLICATION
// ----------------------------------

function renderAll() {
  renderDashboard();
  renderPatients();
  renderDoctors();
  renderAppointments();
  renderBills();
}

renderAll();
$("charCount").textContent = $("message").value.length;
