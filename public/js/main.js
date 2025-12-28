 // SIMPLIFIED JavaScript - This will definitely work
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Document loaded - JavaScript running');
        
        // Mobile menu toggle
        const menuIcon = document.getElementById('menuIcon');
        const menu = document.getElementById('innerCont');
        
        if (menuIcon && menu) {
            menuIcon.addEventListener('click', function() {
                console.log('Menu icon clicked');
                menu.classList.toggle('active');
                menuIcon.classList.toggle('active');
                
                if (menu.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = 'auto';
                }
            });
        }

        // FIXED: Simple dropdown functionality
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                console.log('Dropdown clicked');
                e.preventDefault();
                
                const dropdown = this.closest('.dropdown');
                
                // Toggle current dropdown
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                } else {
                    // Close all other dropdowns
                    document.querySelectorAll('.dropdown').forEach(otherDropdown => {
                        otherDropdown.classList.remove('active');
                    });
                    // Open current dropdown
                    dropdown.classList.add('active');
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });

        // Button swap functionality
        const swapBtn = document.getElementById('swap-btn');
        const registerBtn = document.getElementById('signUpBtn');
        const loginBtn = document.getElementById('logInButton');

        if (registerBtn && swapBtn && loginBtn) {
            swapBtn.style.left = "0px";
            loginBtn.style.color = "white";
            registerBtn.style.color = "black";
            
            registerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                swapBtn.style.left = "125px";
                loginBtn.style.color = "black";
                registerBtn.style.color = "white";
                window.location.href = "/form";
            });
            
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                swapBtn.style.left = "0px";
                loginBtn.style.color = "white";
                registerBtn.style.color = "black";
                handleLoginClick();
            });
        }

        // Other button functionality
        const onlineTestBtn = document.getElementById('onlineTest1');
        const ebookBtn = document.getElementById('ebookBtn');
        const certificateBtn = document.getElementById('certificate');

        if (onlineTestBtn) {
            onlineTestBtn.addEventListener("click", function() {
                window.location.href = "/RTS/public/main.html";
            });
        }

        if (ebookBtn) {
            ebookBtn.addEventListener("click", function() {
                window.location.href = "/ebook";
            });
        }

        if (certificateBtn) {
            certificateBtn.addEventListener('click', function() {
                window.location.href = "/verify";
            });
        }

        // Hero Slider
        const heroSlides = document.querySelectorAll('.hero-slide');
        const heroDots = document.querySelectorAll('.hero-dot');
        let currentSlide = 0;
        
        function showSlide(n) {
            if (heroSlides.length === 0) return;
            
            heroSlides.forEach(slide => slide.classList.remove('active'));
            heroDots.forEach(dot => dot.classList.remove('active'));
            
            currentSlide = (n + heroSlides.length) % heroSlides.length;
            
            heroSlides[currentSlide].classList.add('active');
            if (heroDots[currentSlide]) {
                heroDots[currentSlide].classList.add('active');
            }
        }
        
        heroDots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
        
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);

        // Back to top functionality
        const backToTop = document.querySelector('.back-to-top');
        
        if (backToTop) {
            backToTop.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            window.addEventListener('scroll', function() {
                if (window.scrollY > 300) {
                    backToTop.style.opacity = '1';
                    backToTop.style.visibility = 'visible';
                } else {
                    backToTop.style.opacity = '0';
                    backToTop.style.visibility = 'hidden';
                }
            });
        }

        // Newsletter form submission
        document.querySelectorAll('.newsletter-form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                if (emailInput) {
                    const email = emailInput.value;
                    alert(`Thank you for subscribing with: ${email}`);
                    this.reset();
                }
            });
        });
    });

    function handleLoginClick() {
        const token = getCookie('token');

        if (token) {
            fetch('/api/verify-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    switch (data.role) {
                        case 'student':
                            window.location.href = '/student';
                            break;
                        case 'teacher':
                            window.location.href = '/teacher';
                            break;
                        case 'organisation':
                            window.location.href = '/organisation';
                            break;
                        case 'admin':
                            window.location.href = '/admin';
                            break;
                        default:
                            window.location.href = '/login';
                    }
                } else {
                    window.location.href = '/login';
                }
            })
            .catch(error => {
                console.error('Error verifying token:', error);
                window.location.href = '/login';
            });
        } else {
            window.location.href = '/login';
        }
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Test function to manually trigger dropdown
    function testDropdown() {
        const dropdown = document.querySelector('.dropdown');
        if (dropdown) {
            dropdown.classList.add('active');
            console.log('Dropdown activated manually');
        }
    }