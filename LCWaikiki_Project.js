(() => {
    let $;

    // loading jquery
    const loadJQuery = (callback) => {
        if (typeof jQuery === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
            script.onload = () => {
                $ = jQuery.noConflict(true);
                callback();
            };
            script.onerror = () => {
                console.error("An error occurred while loading jQuery.");
            };
            document.head.appendChild(script);
        } else {
            $ = jQuery;
            callback();
        }
        //lcw doesn't have jquery so we have to load it
    };

    const self = {
        productUrl: 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json',
        localStorageKey: 'lcw-favorites', //for our favorites
        products: null, //for product datas
        currentIndex: 0, //which product are we seeing

        init: () => {
            $(document).ready(() => {
                self.fetchProducts();
            });
        },

        fetchProducts: () => {
            self.products = self.getFromLocalStorage(); //first we pull favorites from localstorage 
            if (self.products) {
                self.buildCarousel();
            } else {
                $.getJSON(self.productUrl, (data) => { //if we don't any, we get product data in JSON format from outside
                    if (!Array.isArray(data)) {
                        console.error("The expected data format is not string.");
                        return;
                    }
                    self.products = data.map(product => ({ ...product, isFavorite: false })); //add favorite feature to product
                    localStorage.setItem(self.localStorageKey, JSON.stringify(self.products)); //favorites are saved in localstorage
                    self.buildCarousel();
                }).fail((jqxhr, textStatus, error) => {
                    console.error("An error occurred while loading products:", textStatus, error);
                });
            }
        },

        getFromLocalStorage: () => {
            try {
                const stored = localStorage.getItem(self.localStorageKey); //gets list of favorite products from localStorage
                return stored ? JSON.parse(stored) : null; //returns data in JSON format
            } catch (error) {
                console.error("An error occurred while reading data from LocalStorage:", error);
                localStorage.removeItem(self.localStorageKey); //data in localStorage is deleted
                return null;
            }
        },

        isProductFavorited: (productId) => {
            //checks products and if its add favorites returns ture, if it isn't returns false
            return self.products && self.products.some(p => p.id === productId && p.isFavorite);
        },

        updateFavorites: (productId) => {
            if (!self.products) return;
            const productIndex = self.products.findIndex(p => p.id === productId);
            //for change our product's favorite value
            if (productIndex > -1) {
                self.products[productIndex].isFavorite = !self.products[productIndex].isFavorite;
                localStorage.setItem(self.localStorageKey, JSON.stringify(self.products));
                self.buildCarousel();
            }
        },

        buildCarousel: () => {
            if (!self.products) return;

            const carouselContainer = $('#similar-items-recommendations .recommendation-carousel .carousel-container');
            if (!carouselContainer.length) {
                console.error("#similar-items-recommendations .recommendation-carousel .carousel-container element not found. Please add this element.");
                return;
            }

            if (carouselContainer.find('.my-custom-carousel').length) {
                console.log('Carousel already exist. Skipping creation ');
                return;
            }

            let itemsToShow = self.calculateItemsToShow();

            const carouselHTML = `
                <div class="carousel padded-carousel my-custom-carousel">
                    <p class="similar-products-title">You Might Also Like</p>
                    <div class="carousel-inner">
                        ${self.products.map(product => `
                            <div class="product-item">
                                <a href="${product.url}" target="_blank">
                                    <img src="${product.img}" alt="${product.name}">
                                </a>
                                <div class="product-info">
                                    <a href="${product.url}" target="_blank">${product.name}</a>
                                    <span class="price">${product.price} TL</span>
                                </div>
                                <div class="heart ${self.isProductFavorited(product.id) ? 'active' : ''}" data-product-id="${product.id}">
                                    <svg class="heart-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${self.isProductFavorited(product.id) ? '#193db0' : 'none'}" stroke="${self.isProductFavorited(product.id) ? '#193db0' : '#555'}" stroke-width="2"/>
                                    </svg>
                                </div>
                            </div>`).join('')}
                    </div>
                    <button class="carousel-button prev">‹</button>
                    <button class="carousel-button next">›</button>
                </div>`;

            carouselContainer.append(carouselHTML);
            self.buildCSS(itemsToShow);
            self.setEvents();
        },

        calculateItemsToShow: () => {
            //responsive design
            const screenWidth = $(window).width();
            if (screenWidth >= 1280) {
                return 6.5;  // full screen (1280px)
            } else if (screenWidth >= 768) {
                return 4.5;  // 2/3 screen (between 768px and 1280px)
            } else {
                return 3;  // 1/2 screen (768px and under)
            }
        },

        buildCSS: (itemsToShow) => {
            const css = `
                .my-custom-carousel {
                    position: relative;
                    width: 100%;
                    overflow: visible;
                    padding: 20px 0;
                }

                .my-custom-carousel .carousel-inner {
                    display: flex;
                    transition: transform 0.3s ease-in-out;
                }

                .my-custom-carousel .product-item {
                    flex: 0 0 calc(${(100 / itemsToShow)}% - 20px);
                    margin: 0 10px;
                    overflow: hidden;
                    text-align: center;
                    box-shadow: none;
                    position: relative;
                    height: 380px;
                    background-color: white;
                }

                .my-custom-carousel .product-item img {
                    width: 100%;
                    height: 270px;
                    display: block;
                    object-fit: cover;
                }

                .my-custom-carousel .product-info {
                    padding: 10px;
                    font-size: 14px;
                    color: #333;
                    text-align: left;
                }
                .my-custom-carousel .product-info a {
                    text-decoration: none;
                    font-weight: lighter;
                    font-family: Arial, sans-serif;
                    color: #302e2b !important;
                    display: block;
                    margin-bottom: 5px;
                }

                .my-custom-carousel .product-info span.price {
                    color: #193db0;
                    font-size: 18px;
                    display: inline-block;
                    line-height: 22px;
                    font-weight: bold;
                }

                .my-custom-carousel .heart {
                    cursor: pointer;
                    position: absolute;
                    top: 9px;
                    right: 15px;
                    width: 34px;
                    height: 34px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .16);
                    border: solid .5px #b6b7b9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .my-custom-carousel .heart.active {
                    color: #193db0;
                }

                .my-custom-carousel .carousel-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    color: black;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    padding: 5px;
                    z-index: 10;
                    font-size: 65px;
                }

                .my-custom-carousel .carousel-button.prev {
                    left: -35px; 
                }

                .my-custom-carousel .carousel-button.next {
                    right: -35px; 
                }

                .my-custom-carousel .similar-products-title {
                    font-size: 26px;
                    font-weight: lighter;
                    margin-bottom: 10px;
                    color: #333;
                    text-align: left;
                }

                @media (max-width: 768px) {
                    .my-custom-carousel .product-item {
                        flex: 0 0 calc(33.33% - 20px); 
                    }
                }

                @media (min-width: 768px) and (max-width: 1280px) {
                    .my-custom-carousel .product-item {
                        flex: 0 0 calc(22.22% - 20px); 
                    }
                }

                @media (min-width: 1280px) {
                    .my-custom-carousel .product-item {
                        flex: 0 0 calc(15.38% - 20px); 
                    }
                }
            `;
            $('.carousel-style').remove();
            $('<style>').addClass('carousel-style').html(css).appendTo('head');
        },

        setEvents: () => {
            $('.my-custom-carousel .carousel-button.prev').off('click').on('click', function() {
                const $carousel = $(this).closest('.my-custom-carousel');
                $carousel.find('.carousel-inner').animate({
                    scrollLeft: $carousel.find('.carousel-inner').scrollLeft() - $carousel.find('.product-item').width()
                }, 300);
            });

            $('.my-custom-carousel .carousel-button.next').off('click').on('click', function() {
                const $carousel = $(this).closest('.my-custom-carousel');
                $carousel.find('.carousel-inner').animate({
                    scrollLeft: $carousel.find('.carousel-inner').scrollLeft() + $carousel.find('.product-item').width()
                }, 300);
            });

            $('.my-custom-carousel .heart').off('click').on('click', function() {
                const productId = parseInt($(this).data('product-id'));
                self.updateFavorites(productId);

                const svgPath = $(this).find('.heart-svg path');
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    svgPath.attr('fill', 'none').attr('stroke', '#555');
                } else {
                    $(this).addClass('active');
                    svgPath.attr('fill', '#193db0').attr('stroke', '#193db0');
                }
            });
        }
    };

    loadJQuery(() => {
        self.init();
    });
})();