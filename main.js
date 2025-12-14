document.addEventListener("DOMContentLoaded", () => {
    // ===== عناصر الصفحة =====//
    const authModel = document.querySelector('.auth-model');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const loginBtnIcon = document.querySelector('#login-btn');
    const loginClose = document.querySelector('#close');
    let menBar = document.querySelector('#mainbar');
    let navBar = document.querySelector('.navbar');

    function showProfile(user) {
        const profileContainer = document.getElementById("profile-container");
        const loginForm = document.querySelector(".form-container.login");
        const editdata = document.getElementById("editProfileModal");
        const registerForm = document.querySelector(".form-container.register");
        authModel.classList.add("show");
        // إخفاء النماذج
        loginForm.classList.add("hidden");
        authModel.classList.remove("active")
        registerForm.classList.add("hidden");
        editdata.classList.add("hidden")
        profileContainer.classList.remove("hidden");
        // عرض بيانات المستخدم
        document.getElementById("profile-name").textContent =
            `${user.person.firstName} ${user.person.lastName}`;
        document.getElementById("profile-email").textContent = user.person.email;
        document.getElementById("profile-phone").textContent = user.person.phone;
        document.getElementById("profile-country").textContent = user.person.country.countryName;
        document.getElementById("logout-btn").textContent = "logout";
        if (user.person.isMale === false) {
            document.getElementById("profile-gender").textContent = "female";
        }
        else {
            document.getElementById("profile-gender").textContent = "male";
        }


        // زر تسجيل الخروج
        document.getElementById("logout-btn").onclick = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            profileContainer.classList.add("hidden");
            loginForm.classList.remove("hidden");
            registerForm.classList.remove("hidden");
            alert("تم تسجيل الخروج بنجاح ✅");
        };

    }
    document.querySelectorAll(".faq-question").forEach(q => {
        q.addEventListener("click", () => {
            const item = q.parentElement;

            // إغلاق كل العناصر غير المختارة
            document.querySelectorAll(".faq-item").forEach(i => {
                if (i !== item) i.classList.remove("active");
            });

            // تبديل الحالي
            item.classList.toggle("active");
        });
    });
    // ===== أحداث التمرير =====
    window.onscroll = () => {
        menBar.classList.remove('fa-times');
        navBar.classList.remove("active");
    };
    // ===== قائمة الموبايل =====
    menBar.addEventListener('click', () => {
        menBar.classList.toggle('fa-times');
        navBar.classList.toggle("active");
    });
    // ===== التنقل بين login و register =====
    registerLink.addEventListener('click', () => {
        authModel.classList.add('active');
    });

    loginLink.addEventListener('click', () => {
        authModel.classList.remove('active');
    });

    loginBtnIcon.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            showProfile(user);
        }
        else {
            authModel.classList.add('show');
        }
    });

    loginClose.addEventListener('click', () => {
        authModel.classList.remove('show', 'active');
    });


    // ===== تسجيل الدخول =====
    const loginBt = document.getElementById("login-bt");

    loginBt.addEventListener("click", async (e) => {
        e.preventDefault();

        const emailOrPhone = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        // التحقق من الحقول الفارغة
        if (!emailOrPhone && !password) {
            alert("⚠️ الرجاء إدخال الإيميل أو رقم الهاتف وكلمة المرور");
            return;
        }
        if (!emailOrPhone) {
            alert("⚠️ الرجاء إدخال الإيميل أو رقم الهاتف");
            return;
        }
        if (!password) {
            alert("⚠️ الرجاء إدخال كلمة المرور");
            return;
        }

        try {
            const resp = await fetch("http://yamankassab-001-site1.mtempurl.com/api/User/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailOrPhone, password }),
            });

            const data = await resp.json();

            if (!resp.ok) {
                const msg = data?.error || "حدث خطأ غير معروف";
                alert("❌ فشل تسجيل الدخول: " + msg);
                return;
            }

            // حفظ التوكن وبيانات المستخدم
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));


            authModel.classList.remove("active", "show");

            alert(`🎉 أهلاً ${data.user.person.firstName}! تم تسجيل الدخول بنجاح.`);


        } catch (error) {
            console.error("خطأ بالشبكة:", error);
            alert("⚠️ حدث خطأ في الاتصال بالخادم، حاول لاحقاً.");
        }

    });
    const deleteAccountBtn = document.getElementById("deleteAccount");
    deleteAccountBtn.addEventListener("click", async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const confirmDeleteAccount = confirm("Are you sure?");
        if (!confirmDeleteAccount) return
        if (!user) {
            alert("You must be logged in");
            return;
        }
        const res = await fetch(`http://yamankassab-001-site1.mtempurl.com/api/User/DeleteUserByUserID?UserID=${user.userID}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            }
        );

        if (res.ok) {
            localStorage.removeItem("user");
            alert("Account deleted successfully");
            profileContainer.classList.add("hidden");
            loginForm.classList.remove("hidden");
            registerForm.classList.remove("hidden");
        } else {
            alert("Failed to delete account");
        }
    });

    // ===== إنشاء حساب جديد =====
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("password").value.trim();
        const first_name = document.getElementById("first-name").value.trim();
        const last_name = document.getElementById("last-name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const country = document.getElementById("country").value.trim();
        const gender = document.getElementById("gender").value;

        // التحقق من الحقول الأساسية
        if (!email || !password) {
            alert("⚠️ الرجاء إدخال الإيميل وكلمة المرور");
            return;
        }

        try {
            // تجهيز البيانات حسب شكل الـ API
            const registerBody = {
                userID: 0,
                firstName: first_name,
                lastName: last_name,
                phone: phone,
                email: email,
                isMale: (gender === "Male"),
                dateOfBirth: new Date().toISOString(),
                image: " ",
                countryID: 1,
                createAt: new Date().toISOString(),
                role: "User",
                password: password

            };

            const resp = await fetch("http://yamankassab-001-site1.mtempurl.com/api/User/AddNewUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerBody),
            });

            const data = await resp.json();
            console.log("Server response:", data);
            if (!resp.ok || data.userID === -1) {
                alert("❌ فشل إنشاء الحساب: قد يكون البريد الإلكتروني أو رقم الهاتف مستخدم مسبقاً.");
                return;
            }

            alert("🎉 تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");

            alert("🎉 تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
            authModel.classList.remove("active");

        } catch (error) {
            console.error("خطأ بالشبكة:", error);
            alert("⚠️ حدث خطأ في الاتصال بالخادم، حاول لاحقاً.");
        }
    });
    // update
    document.getElementById("editProfileBtn").addEventListener("click", () => {
        const profileContainer = document.getElementById("profile-container");
        profileContainer.classList.add("hidden");
        const editdata = document.getElementById("editProfileModal");
        editdata.classList.remove("hidden");
        authModel.classList.add("active");
        const user = JSON.parse(localStorage.getItem("user"));

        // عبي البيانات قبل الفتح
        document.getElementById("edit-first").value = user.person.firstName;
        document.getElementById("edit-last").value = user.person.lastName;
        document.getElementById("edit-email").value = user.person.email;
        document.getElementById("edit-phone").value = user.person.phone;
        document.getElementById("edit-country").value = user.person.country.countryName;
    });
    document.getElementById("closeEdit").addEventListener("click", () => {
        const editdata = document.getElementById("editProfileModal");
        editdata.classList.add("hidden")
        const user = JSON.parse(localStorage.getItem("user"));
        showProfile(user);

    });
    document.getElementById("editProfileForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedData = {
            userID: user.userID,
            firstName: document.getElementById("edit-first").value,
            lastName: document.getElementById("edit-last").value,
            phone: document.getElementById("edit-phone").value,
            email: document.getElementById("edit-email").value,
            isMale: (gender === "Male"),
            dateOfBirth: new Date().toISOString(),
            image: " ",
            countryID: 1
        }
        try {
            const resp = await fetch("http://yamankassab-001-site1.mtempurl.com/api/User/UpdateUser", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            const data = await resp.json();

            if (!resp.ok) {
                alert("❌ فشل التعديل!");
                return;
            }

            // تحدّيث البيانات محلياً
            localStorage.setItem("user", JSON.stringify(data));

            alert("✔️ تم تعديل البيانات بنجاح!");
        } catch (err) {
            console.error("Network error:", err);
            alert("⚠️ خطأ في الاتصال.");
        }
    });
    function getStars(rating) {
        let stars = "";
        let full = Math.floor(rating);    // عدد النجوم الكاملة
        let half = rating % 1 !== 0;      // إذا في نص نجمة
        for (let i = 0; i < full; i++) {
            stars += '<i class="fa-solid fa-star" style="color: gold;font-size:18px"></i>';
        }
        if (half) {
            stars += '<i class="fa-solid fa-star-half-stroke" style="color: gold;font-size:18px"></i>';
        }
        let emptyCount = 5 - full - (half ? 1 : 0);
        for (let i = 0; i < emptyCount; i++) {
            stars += '<i class="fa-regular fa-star" style="color: gold;font-size:18px"></i>';
        }
        return stars;
    }
    function formatDateTime(dateTimeString) {
        const [date, time] = dateTimeString.split("T");
        const [year, month, day] = date.split("-");
        const [hour, minute] = time.split(":");

        return {
            date: `${year}/${month}/${day}`,
            time: `${hour}:${minute}`
        };
    }
    function statustrip(status) {
        if (status === 1) {
            return `<p style="color:blue">inprogerss</p>`
        }
        else if (status === 2)
            return `<p style="color:green">completed</p>`
        else

            return `<p style="color:red">inprogerss</p>`
    }
    async function fetchTrips() {
        try {
            const tripsRes = await fetch("http://yamankassab-001-site1.mtempurl.com/api/Trip/GetAllTrips");
            if (!tripsRes.ok) throw new Error("Failed to fetch trips");
            const tripsData = await tripsRes.json();
            const trips = await Promise.all(tripsData.map(async trip => {
                // جلب الصور
                const imgRes = await fetch(`http://yamankassab-001-site1.mtempurl.com/api/TripImage/GetAllTripImages/${trip.tripID}`);
                const images = await imgRes.ok ? await imgRes.json() : [];
                const firstImage = images.length > 0 ? images[0].imageUrl : "images/pexels-pixabay-50594.jpg";
                // جلب الخدمات
                let services = [];
                try {
                    const servicesRes = await fetch(`http://yamankassab-001-site1.mtempurl.com/api/TripService/GetTripServicesByTripID?TripID=${trip.tripID}`);
                    if (servicesRes.ok) {
                        const data = await servicesRes.json();
                        if (Array.isArray(data)) {
                            services = data.map(s => ({
                                serviceID: s.service.serviceID,
                                serviceName: s.service.serviceName,
                                price: s.price,
                                description: s.service.description
                            }));
                        }
                    }
                } catch (err) { services = []; }
                return {
                    tripID: trip.tripID,
                    imageUrl: firstImage,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    address: trip.company.address,
                    company: trip.company.companyName,
                    departure: trip.departureCity.cityName,
                    arrival: trip.arrivalCity.cityName,
                    price: trip.price,
                    status: trip.status,
                    phone: trip.company.phone,
                    rating: trip.rating,
                    details: trip.details,
                    seat: trip.seatsAvailable,
                    services: services
                };
            }));

            window.allTrips = trips; // تخزين الرحلات عالمياً
            displayTrips(trips);

        } catch (err) {
            console.error("Error fetching trips:", err);
        }
    }


    // ====== عرض الرحلات بالكروت ======
    function displayTrips(trips) {
        const container = document.getElementById("tripsContainer");
        container.innerHTML = "";

        trips.forEach(t => {
            const div = document.createElement("div");
            div.classList.add("trip-card");
            div.innerHTML = `
            <img src="${t.imageUrl}" class="trip-img" />
            <h3>${t.departure} ➝ ${t.arrival}</h3>
            <p>Company: ${t.company}</p>
            <p>Price: $${t.price}</p>
            <p>${getStars(t.rating)}</p>
            <button class="btn-details" data-id="${t.tripID}">Details</button>
            <button class="btn-addcart" data-id="${t.tripID}">Add to Cart</button>`
                ;
            container.appendChild(div);
        });
        document.getElementById("cartBtn").addEventListener("click", () => {
            document.getElementById("cartModal").classList.add("auth-model");
            document.getElementById("cartModal").classList.add("show")
        })
        // أحداث التفاصيل
        document.querySelectorAll(".btn-details").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                showDetails(id);
            });
        });
        // أحداث إضافة للسلة
        document.querySelectorAll(".btn-addcart").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = parseInt(btn.dataset.id);
                await addToCart(id);
            });
        });

        document.querySelectorAll("#btn-book").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = parseInt(btn.dataset.id);
                await bookdetails(id);
            })
        });
    }
    fetchTrips();
    async function bookdetails(id, oldReservation = null) {
        const trip = window.allTrips.find(t => t.tripID === id);
        if (!trip) return;

        let currentOldReservation = oldReservation;

        // ===== المودال =====
        const bookModal = document.getElementById("bookModal");
        bookModal.classList.remove("hidden");
        bookModal.classList.add("modal");

        // عرض بيانات الرحلة
        document.getElementById("imgbook").src = trip.imageUrl;
        document.getElementById("num-seats").innerText = trip.seat;

        const seatInput = document.getElementById("seatCount");
        const seatError = document.getElementById("seatError");
        seatInput.max = trip.seat;
        seatInput.min = 1;
        seatInput.value = 1;

        // ===== عرض الخدمات =====
        const servicesbook = document.getElementById("servicecontent");
        servicesbook.innerHTML = "";

        if (trip.services?.length > 0) {
            const title = document.createElement("h4");
            title.innerText = "Services";
            servicesbook.appendChild(title);

            trip.services.forEach(s => {
                const wrap = document.createElement("div");
                wrap.classList.add("service");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `srv-${trip.tripID}-${s.serviceID}`;
                checkbox.dataset.price = s.price;

                // إذا هذا تعديل → تحقق هل الخدمة موجودة بالحجز القديم
                checkbox.checked = false;
                updateTotalPrice()

                // الخدمات المجانية تعطّل
                if (s.price === 0) {
                    checkbox.checked = true;
                    checkbox.disabled = true
                }

                const label = document.createElement("label");
                label.classList.add("check");
                label.htmlFor = checkbox.id;
                label.innerText = `${s.serviceName} (${s.price === 0 ? "Free" : "$" + s.price}) ➝ ${s.description}`;

                wrap.appendChild(checkbox);
                wrap.appendChild(label);
                servicesbook.appendChild(wrap);
            });
            document.querySelectorAll("#servicecontent input[type='checkbox']").forEach(cb => {
                cb.addEventListener("change", updateTotalPrice);
            });

        } else {
            const noServices = document.createElement("p");
            noServices.innerText = "No services available for this trip.";
            servicesbook.appendChild(noServices);
        }

        // ===== تحديث السعر =====
        function updateTotalPrice() {
            const seats = Number(seatInput.value);
            const maxSeats = trip.seat;

            // التحقق من عدد المقاعد
            if (seats < 1 || seats > maxSeats) {
                seatError.style.display = "block";
                seatError.innerText = `Available seats: ${maxSeats} only`;
            } else {
                seatError.style.display = "none";
            }

            // حساب مجموع الخدمات المختارة
            let servicesTotal = 0;
            const checkedServices = document.querySelectorAll("#servicecontent input[type='checkbox']:checked");
            checkedServices.forEach(cb => {
                servicesTotal += Number(cb.dataset.price);
            });

            // السعر الكلي = (سعر الرحلة + مجموع الخدمات) × عدد الأشخاص
            let total = (trip.price + servicesTotal) * seats;

            // عرض السعر
            document.getElementById("pricebook").innerText = total.toFixed(2) + "$";
        }

        updateTotalPrice();
        seatInput.addEventListener("input", updateTotalPrice);

        // ===== حفظ / تعديل الحجز =====
        document.getElementById("bookNow").onclick = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return alert("❌ لازم تسجلي دخول قبل الحجز");

            const seats = Number(seatInput.value);
            if (seats < 1) return alert("⚠️ أدخلي عدد مقاعد صالح");
            updateTotalPrice();
            const total = Number(document.getElementById("pricebook").innerText.replace("$", ""));
            const checkedServices = Array.from(document.querySelectorAll("#servicecontent input[type='checkbox']:checked"))
                .map(cb => ({
                    serviceID: Number(cb.id.split("-").pop()),
                    price: Number(cb.dataset.price)
                }));

            if (oldReservation) {

                console.log(oldReservation.seats)
                // ===== تعديل الحجز القديم =====
                const updatedBooking = {
                    ...oldReservation,
                    seatsCount: seats,
                    totalPrice: total
                };

                await fetch("http://yamankassab-001-site1.mtempurl.com/api/Reservation/UpdateReservation", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedBooking)
                });

                // تعديل الخدمات: حذف / إضافة
                for (let s of trip.services) {
                    const res = await fetch(`http://yamankassab-001-site1.mtempurl.com/api/ReservationService/CheckReservationService?ReservationID=${currentOldReservation.reservationID}&ServiceID=${s.serviceID}`);
                    const exists = await res.json();

                    const checkbox = document.getElementById(`srv-${trip.tripID}-${s.serviceID}`);
                    const isChecked = checkbox.checked;

                    if (isChecked && !exists) {
                        // إضافة الخدمة
                        await fetch("http://yamankassab-001-site1.mtempurl.com/api/ReservationService/AddNewReservationService", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                reservationServiceID: 0,
                                reservationID: currentOldReservation.reservationID,
                                serviceID: s.serviceID,
                                price: s.price
                            })
                        });
                    } else if (!isChecked && exists) {
                        // حذف الخدمة
                        await fetch(`http://yamankassab-001-site1.mtempurl.com/api/ReservationService/DeleteReservationServiceByReservationIDAndServiceID?ReservationID=${currentOldReservation.reservationID}&ServiceID=${s.serviceID}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" }
                        });
                    }
                }

                alert("✔️ تم تعديل الحجز بنجاح!");
                location.reload()
            } else {
                // ===== حجز جديد =====
                const reservationBody = {
                    reservationID: 0,
                    userID: user.userID,
                    tripID: trip.tripID,
                    seatsCount: seats,
                    reservationDate: new Date().toISOString(),
                    totalPrice: total,
                    status: 1
                };

                const res = await fetch("http://yamankassab-001-site1.mtempurl.com/api/Reservation/AddNewReservation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(reservationBody)
                });
                const reservationResult = await res.json();
                const reservationID = reservationResult.reservationID;

                for (let s of checkedServices) {
                    await fetch("http://yamankassab-001-site1.mtempurl.com/api/ReservationService/AddNewReservationService", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            reservationServiceID: 0,
                            reservationID: reservationID,
                            serviceID: s.serviceID,
                            price: s.price
                        })
                    });
                }

                alert("✔️ تم الحجز بنجاح!");
            }

            // إغلاق المودال بعد الحفظ
            bookModal.classList.add("hidden");
            bookModal.classList.remove("modal");
        };
    }
    // ====== عرض التفاصيل بالمودال ======
    function showDetails(id) {
        const trip = window.allTrips.find(t => t.tripID === id);
        if (!trip) return;
        const user = JSON.parse(localStorage.getItem("user"))
        const bookbtn = document.getElementById("btn-book")
        if (trip.status != 1) {
            bookbtn.style.display = "none";
        }
        else if (!user) {
            bookbtn.style.display = "none";
            const msg = document.createElement("p")
            msg.classList.add("msg");
            msg.innerText = "you can't book please log in first "
            bookbtn.parentElement.appendChild(msg)
        }
        else {
            bookbtn.style.display = "block";
        }

        const dep = formatDateTime(trip.departureTime);
        const arr = formatDateTime(trip.arrivalTime);

        const modal = document.getElementById("tripModal");
        modal.classList.remove("hidden");
        modal.classList.add("modal");
        document.getElementById("modalImage").src = trip.imageUrl;
        document.getElementById("modalRoute").innerText = ` ${trip.departure} ➝ ${trip.arrival}`;
        document.getElementById("modalCompany").innerText = `Company: ${trip.company} | Address: ${trip.address}`;
        document.getElementById("modalTime").innerHTML = `Departure time:
         <div>
         <i class="fa-regular fa-calendar"></i> ${dep.date}
          <i class="fa-regular fa-clock"></i> ${dep.time}</div>
              Arrival time:<div>
          <i class="fa-regular fa-calendar"></i> ${arr.date}
          <i class="fa-regular fa-clock"></i> ${arr.time}</div>`
            ;
        document.getElementById("modalStatus").innerHTML = statustrip(trip.status)
        document.getElementById("modalRating").innerHTML = getStars(trip.rating);
        document.getElementById("modalDetails").innerText = trip.details;
        document.getElementById("btn-book").dataset.id = trip.tripID;

        // الخدمات
        const servicesBox = document.getElementById("servicesContainer");
        servicesBox.innerHTML = "";
        if (trip.services.length > 0) {
            const title = document.createElement("h4");
            title.innerText = "Services";
            servicesBox.appendChild(title);
            trip.services.forEach(s => {
                const div = document.createElement("div");
                div.classList.add("service-item");
                div.innerText = `${s.serviceName} (${s.price === 0 ? "Free" : "$" + s.price}) ➝ ${s.description}`;
                servicesBox.appendChild(div);
            });
        }

    }

    // ===== إضافة للسلة =====
    async function addToCart(tripID) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return alert("❌ يجب تسجيل الدخول أولاً");

        const trip = window.allTrips.find(t => t.tripID === tripID);
        if (!trip) return;

        // السلة مرتبطة بالـ userID
        let cart = JSON.parse(localStorage.getItem(`cart_${user.userID}`)) || [];

        // إضافة الرحلة إذا لم تكن موجودة
        if (!cart.some(t => t.tripID === trip.tripID)) {
            cart.push({
                tripID: trip.tripID,
                imageUrl: trip.imageUrl,
                departure: trip.departure,
                arrival: trip.arrival,
                price: trip.price
            });
        }

        localStorage.setItem(`cart_${user.userID}`, JSON.stringify(cart));
        alert("تمت إضافة الرحلة للسلة!");
    }

    // ===== فتح السلة وعرض محتواها =====
    const cartBtn = document.getElementById("cartBtn");
    const cartModal = document.getElementById("cartModal");
    const cartContainer = document.getElementById("cartContainer");
    const closeCart = document.getElementById("closeCart");

    cartBtn.addEventListener("click", () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return alert("❌ يجب تسجيل الدخول لعرض السلة");

        // جلب السلة الخاصة بالمستخدم الحالي
        let cart = JSON.parse(localStorage.getItem(`cart_${user.userID}`)) || [];
        const updatedCart = cart.map(item => {
            const trip = window.allTrips.find(t => t.tripID === item.tripID);
            if (trip) {
                return { ...item, price: trip.price, imageUrl: trip.imageUrl };
            }
            return null;
        }).filter(Boolean);

        localStorage.setItem(`cart_${user.userID}`, JSON.stringify(updatedCart));
        cart = updatedCart;
        cartContainer.innerHTML = "";
        cart.forEach(trip => {
            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.innerHTML = `
            <img src="${trip.imageUrl}" width="50px">
            <span class="cart-trip-name" data-id="${trip.tripID}">${trip.departure} ➝ ${trip.arrival} | ${trip.price}</span>
            <button class="btn-remove-cart" data-id="${trip.tripID}">Remove</button>`
                ;
            cartContainer.appendChild(div);
        });
        // إضافة حدث على أسماء الرحلات لفتح Show Detail
        document.querySelectorAll(".cart-trip-name").forEach(el => {
            el.addEventListener("click", async () => {
                const tripID = parseInt(el.dataset.id);
                await showDetails(tripID);
            });
        });

        // إزالة عنصر من السلة
        document.querySelectorAll(".btn-remove-cart").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                cart = cart.filter(t => t.tripID !== id);
                localStorage.setItem(`cart_${user.userID}`, JSON.stringify(cart));
                btn.parentElement.remove();
            });
        });

        cartModal.style.display = "block";
    });

    closeCart.addEventListener("click", () => {
        cartModal.style.display = "none";
    });



    // ====== إغلاق المودال ======
    document.getElementById("closedet").addEventListener("click", () => {
        document.getElementById("tripModal").classList.add("hidden");
        document.getElementById("tripModal").classList.remove("modal");
    });
    document.getElementById("closebook").addEventListener("click", () => {
        document.getElementById("bookModal").classList.add("hidden");
        document.getElementById("bookModal").classList.remove("modal");
    });
    document.getElementById("mybook").addEventListener("click", async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("you should login to show your boook");

            return;
        }
        const section = document.getElementById("mybooksec");
        section.style.backgroundImage = "none";
        section.style.height = "fit-content"
        section.classList.add("color");
        section.innerHTML = `<h1 class="heading">
            <span>M</span>
            <span>y</span>
            <span>b</span>
            <span>o</span>
            <span>o</span>
            <span>k</span>
        </h1>`;



        try {
            const res = await fetch(`http://yamankassab-001-site1.mtempurl.com/api/Reservation/GetAllReservationsByUserID?UserID=${user.userID}`);
            if (!res.ok) throw new Error("Failed to fetch reservations");

            const bookings = await res.json();
            const boxMybook = document.createElement("div");
            boxMybook.classList.add("mybook-box");

            for (let b of bookings) {
                const card = document.createElement("div");
                card.classList.add("cardmybook");
                // جلب خدمات الحجز لكل حجز
                let servicesHTML = "";
                try {
                    const servicesRes = await fetch(`http://yamankassab-001-site1.mtempurl.com/api/ReservationService/GetAllReservationServiceByReservationID?ReservationID=${b.reservationID}`,
                        {
                            method: "GET",
                            headers: { "Contant-Type": "application/json" }
                        });
                    if (servicesRes.ok) {
                        const services = await servicesRes.json();
                        if (services.length > 0) {
                            servicesHTML = `service: 
                            <ul class='services-list'>`;
                            services.forEach(s => {
                                servicesHTML += `<li>${s.service.serviceName} (${s.price === 0 ? "Free" : "$" + s.price})</li>`;
                            });
                            servicesHTML += `</ul>`;
                        } else if (servicesRes === 404) {
                            services = []
                            servicesHTML = `<p>No services selected</p>`;
                        }
                    }
                } catch (err) {
                    servicesHTML = `<p>No services selected</p>`
                }
                // بناء الكارد
                card.innerHTML = `
                <p class="headingmybook">${b.trip.departureCity.cityName} to ${b.trip.arrivalCity.cityName}</p>
                <p>${b.trip.company.companyName}</p>
                <p>Seats: ${b.seatsCount}</p>
                <p>Total: $${b.totalPrice}</p>
                <div class="reservation-services">${servicesHTML}
                </div>
                <div class=edit-btn-book>
                <button class="edit-book">Edit</button>
                <button id="delete-book" onclick="deleteReservation(${b.reservationID})">delete</button>
                </div>
                </section>`
                    ;

                card.querySelector(".edit-book").addEventListener("click", () => {
                    bookdetails(b.trip.tripID, b)
                });

                boxMybook.appendChild(card);
            }

            section.appendChild(boxMybook);
        } catch (err) {
            console.log(err)
            alert("⚠️ خطأ بجلب الحجوزات");
        }
    });

});
async function deleteReservation(reservationID) {
    const confirmDelete = confirm("❌ هل أنتِ متأكدة من حذف هذا الحجز؟");
    if (!confirmDelete) return;

    try {
        // 1️⃣ حذف الخدمات المرتبطة بالحجز
        await fetch(`http://yamankassab-001-site1.mtempurl.com/api/ReservationService/DeleteReservationServiceByReservationID?ReservationID=${reservationID}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        // 2️⃣ حذف الحجز نفسه
        const res = await fetch(`http://yamankassab-001-site1.mtempurl.com/api/Reservation/DeleteReservationByReservationID?ReservationID=${reservationID}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (!res.ok) throw new Error("Delete failed");

        alert(" تم حذف الحجز بنجاح");

        location.reload();

    } catch (err) {
        alert(" صار خطأ أثناء حذف الحجز");
    }
}
var swiper = new Swiper(".review-slider", {

    spaceBetween: 20,

    loop: true,

    breakpoints: {
        640: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 3
        },
    },
});