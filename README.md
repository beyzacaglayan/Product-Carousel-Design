Product Carousel for LC Waikiki Product Pages

Project Completion Summary

A product carousel has been implemented to display related products on LC Waikiki's product pages. The carousel is appended after the .product-detail element.
Product data is retrieved from the following API:
https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json

A title, "You Might Also Like", has been added above the carousel.
The carousel displays six and a half products at a time, with smooth sliding functionality when clicking the arrow buttons.

Clicking on a product opens its page in a new tab.

A heart icon has been added, allowing users to mark products as favorites. Favorited products are stored in local storage, and the heart icon turns blue when selected.
Upon page refresh, the product data is loaded from local storage, preventing additional API requests. Previously favorited products retain their filled heart status.
The design is fully responsive, ensuring proper display on desktop, tablet, and mobile devices. The number of visible products adjusts according to the screen size.
The project is developed using only JavaScript and jQuery, without any third-party libraries like Swiper or Bootstrap.

All functionality is contained within a single JavaScript file, which can be executed directly in the Chrome Developer Tools console.

![Ekran görüntüsü 2025-03-05 133142](https://github.com/user-attachments/assets/883ab71e-b7bd-4a06-9baa-2b024ed87627)
