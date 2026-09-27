import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ulms_core.settings')
django.setup()

from django.db import transaction
from apps.catalog.models import Category, Author, Book, BookCopy

print("[*] Generating 220+ Academic Books for University of Vavuniya...")

# 1. Define Categories
CATEGORIES_DATA = [
    ("Computer Science & Information Technology", "DDC 004", "Computing, algorithms, software engineering, databases, networks, AI and cloud systems."),
    ("Mathematics & Statistics", "DDC 510", "Pure mathematics, applied calculus, linear algebra, probability, and statistical data analysis."),
    ("Biological Sciences & Biotechnology", "DDC 570", "Molecular biology, genetics, ecology, botany, zoology, and microbiological sciences."),
    ("Physical Sciences & Chemistry", "DDC 530", "Classical and quantum physics, electromagnetism, organic, inorganic and analytical chemistry."),
    ("Business Studies & Management", "DDC 658", "Business management, entrepreneurship, organizational behavior, marketing, and strategy."),
    ("Accounting & Financial Economics", "DDC 657", "Financial accounting, cost accounting, corporate finance, auditing, and micro/macroeconomics."),
    ("Technology & Biosystems Engineering", "DDC 620", "Applied engineering technology, robotics, IoT, agro-technology, and renewable systems."),
    ("Vanni & Sri Lanka Heritage Collection", "DDC 954.93", "Special archival collection on Vanni regional history, Ceyloniana, folklore, and local culture."),
]

categories = {}
for name, code, desc in CATEGORIES_DATA:
    cat, _ = Category.objects.get_or_create(name=name, defaults={'code': code, 'description': desc})
    categories[name] = cat

print(f"[+] Loaded {len(categories)} Categories")

# 2. Comprehensive 220+ Books Data
BOOKS_DATA = [
    # --- 1. COMPUTER SCIENCE & IT (45 Books) ---
    {
        "title": "Introduction to Algorithms (4th Edition)",
        "isbn": "978-0262046305",
        "authors": ["Thomas H. Cormen", "Charles E. Leiserson", "Ronald L. Rivest", "Clifford Stein"],
        "category": "Computer Science & Information Technology",
        "publisher": "MIT Press",
        "year": 2022,
        "edition": "4th Edition",
        "call_number": "005.1 COR 2022",
        "shelf_location": "Rack CS-01, Shelf 1",
        "description": "The definitive textbook on modern algorithms covering divide-and-conquer, dynamic programming, greedy algorithms, graph algorithms, and NP-completeness."
    },
    {
        "title": "Artificial Intelligence: A Modern Approach (4th Edition)",
        "isbn": "978-0134610993",
        "authors": ["Stuart Russell", "Peter Norvig"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson",
        "year": 2020,
        "edition": "4th Edition",
        "call_number": "006.3 RUS 2020",
        "shelf_location": "Rack CS-01, Shelf 2",
        "description": "Standard authoritative reference on AI, intelligent agents, search algorithms, logic, machine learning, robotics, and natural language processing."
    },
    {
        "title": "Computer Networking: A Top-Down Approach (8th Edition)",
        "isbn": "978-0136681557",
        "authors": ["James F. Kurose", "Keith W. Ross"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson",
        "year": 2021,
        "edition": "8th Edition",
        "call_number": "004.6 KUR 2021",
        "shelf_location": "Rack CS-02, Shelf 1",
        "description": "Top-down pedagogy focusing on application-layer protocols down to the physical layer, Internet protocols, socket programming, and software-defined networks."
    },
    {
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "isbn": "978-0132350884",
        "authors": ["Robert C. Martin"],
        "category": "Computer Science & Information Technology",
        "publisher": "Prentice Hall",
        "year": 2018,
        "edition": "1st Edition",
        "call_number": "005.1 MAR 2018",
        "shelf_location": "Rack CS-02, Shelf 2",
        "description": "Best practices for writing readable, maintainable code, test-driven development, refactoring, and SOLID design principles."
    },
    {
        "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
        "isbn": "978-0201633610",
        "authors": ["Erich Gamma", "Richard Helm", "Ralph Johnson", "John Vlissides"],
        "category": "Computer Science & Information Technology",
        "publisher": "Addison-Wesley",
        "year": 2017,
        "edition": "Classic Edition",
        "call_number": "005.13 GAM 2017",
        "shelf_location": "Rack CS-02, Shelf 3",
        "description": "The seminal Gang of Four catalog of creational, structural, and behavioral software engineering design patterns."
    },
    {
        "title": "Operating Systems: Internals and Design Principles (9th Edition)",
        "isbn": "978-0134670959",
        "authors": ["William Stallings"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson",
        "year": 2018,
        "edition": "9th Edition",
        "call_number": "005.43 STA 2018",
        "shelf_location": "Rack CS-03, Shelf 1",
        "description": "In-depth treatment of processor processes, threads, SMP, microkernels, concurrency, memory management, and virtual memory."
    },
    {
        "title": "Computer Architecture: A Quantitative Approach (6th Edition)",
        "isbn": "978-0128119051",
        "authors": ["John L. Hennessy", "David A. Patterson"],
        "category": "Computer Science & Information Technology",
        "publisher": "Morgan Kaufmann",
        "year": 2019,
        "edition": "6th Edition",
        "call_number": "004.22 HEN 2019",
        "shelf_location": "Rack CS-03, Shelf 2",
        "description": "Foundations of microprocessor architecture, instruction-level parallelism, cache hierarchies, GPU architectures, and warehouse-scale computers."
    },
    {
        "title": "Database Management Systems (3rd Edition)",
        "isbn": "978-0072465631",
        "authors": ["Raghu Ramakrishnan", "Johannes Gehrke"],
        "category": "Computer Science & Information Technology",
        "publisher": "McGraw-Hill",
        "year": 2016,
        "edition": "3rd Edition",
        "call_number": "005.74 RAM 2016",
        "shelf_location": "Rack CS-04, Shelf 1",
        "description": "Comprehensive practical introduction to database models, SQL, relational algebra, storage engines, indexing, and transaction recovery."
    },
    {
        "title": "Pattern Recognition and Machine Learning",
        "isbn": "978-0387310732",
        "authors": ["Christopher M. Bishop"],
        "category": "Computer Science & Information Technology",
        "publisher": "Springer",
        "year": 2016,
        "edition": "1st Edition",
        "call_number": "006.4 BIS 2016",
        "shelf_location": "Rack CS-04, Shelf 2",
        "description": "Bayesian and statistical foundation of machine learning, linear models for regression and classification, kernel methods, and graphical models."
    },
    {
        "title": "Deep Learning (Adaptive Computation and Machine Learning)",
        "isbn": "978-0262035613",
        "authors": ["Ian Goodfellow", "Yoshua Bengio", "Aaron Courville"],
        "category": "Computer Science & Information Technology",
        "publisher": "MIT Press",
        "year": 2016,
        "edition": "1st Edition",
        "call_number": "006.31 GOO 2016",
        "shelf_location": "Rack CS-04, Shelf 3",
        "description": "Deep neural networks, convolutional networks, sequence models, autoencoders, generative adversarial networks, and representation learning."
    },
    {
        "title": "Head First Design Patterns (2nd Edition)",
        "isbn": "978-1492078005",
        "authors": ["Eric Freeman", "Elisabeth Robson"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2021,
        "edition": "2nd Edition",
        "call_number": "005.1 FRE 2021",
        "shelf_location": "Rack CS-05, Shelf 1",
        "description": "Brain-friendly guide to object-oriented principles, design patterns (Observer, Strategy, Decorator, Factory), and code reuse in Java."
    },
    {
        "title": "Designing Data-Intensive Applications",
        "isbn": "978-1449373320",
        "authors": ["Martin Kleppmann"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2017,
        "edition": "1st Edition",
        "call_number": "005.7 KLE 2017",
        "shelf_location": "Rack CS-05, Shelf 2",
        "description": "The big ideas behind reliable, scalable, and maintainable systems: replication, partitioning, transactions, consensus, and stream processing."
    },
    {
        "title": "Python Crash Course (3rd Edition)",
        "isbn": "978-1718502703",
        "authors": ["Eric Matthes"],
        "category": "Computer Science & Information Technology",
        "publisher": "No Starch Press",
        "year": 2023,
        "edition": "3rd Edition",
        "call_number": "005.133 MAT 2023",
        "shelf_location": "Rack CS-05, Shelf 3",
        "description": "Fast-paced introduction to Python programming, data structures, object-oriented concepts, web applications with Django, and data visualization."
    },
    {
        "title": "Learning React: Modern Patterns for Developing React Apps",
        "isbn": "978-1492051725",
        "authors": ["Alex Banks", "Eve Porcello"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2020,
        "edition": "2nd Edition",
        "call_number": "005.276 BAN 2020",
        "shelf_location": "Rack CS-06, Shelf 1",
        "description": "Modern frontend development using React 18, functional components, hooks, state management, and asynchronous data fetching."
    },
    {
        "title": "Full Stack Development with Spring Boot 3 and React",
        "isbn": "978-1805122463",
        "authors": ["Juha Hinkula"],
        "category": "Computer Science & Information Technology",
        "publisher": "Packt Publishing",
        "year": 2023,
        "edition": "4th Edition",
        "call_number": "005.133 HIN 2023",
        "shelf_location": "Rack CS-06, Shelf 2",
        "description": "Building full-stack enterprise web applications using Spring Boot 3, Spring Security, JWT authentication, and modern React with Vite."
    },
    {
        "title": "Software Engineering: A Practitioner's Approach (9th Edition)",
        "isbn": "978-1259872976",
        "authors": ["Roger S. Pressman", "Bruce R. Maxim"],
        "category": "Computer Science & Information Technology",
        "publisher": "McGraw-Hill",
        "year": 2020,
        "edition": "9th Edition",
        "call_number": "005.1 PRE 2020",
        "shelf_location": "Rack CS-06, Shelf 3",
        "description": "The quintessential guide to the software engineering discipline, agile processes, requirements analysis, system modeling, and verification."
    },
    {
        "title": "Compilers: Principles, Techniques, and Tools (Dragon Book)",
        "isbn": "978-0321486813",
        "authors": ["Alfred V. Aho", "Monica S. Lam", "Ravi Sethi", "Jeffrey D. Ullman"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson",
        "year": 2014,
        "edition": "2nd Edition",
        "call_number": "005.45 AHO 2014",
        "shelf_location": "Rack CS-07, Shelf 1",
        "description": "Classic textbook on lexical analysis, syntax-directed translation, symbol tables, code optimization, and runtime environments."
    },
    {
        "title": "Introduction to the Theory of Computation (3rd Edition)",
        "isbn": "978-1133187790",
        "authors": ["Michael Sipser"],
        "category": "Computer Science & Information Technology",
        "publisher": "Cengage Learning",
        "year": 2013,
        "edition": "3rd Edition",
        "call_number": "511.35 SIP 2013",
        "shelf_location": "Rack CS-07, Shelf 2",
        "description": "Clear presentation of automata theory, regular expressions, context-free grammars, Turing machines, decidability, and time complexity."
    },
    {
        "title": "Data Mining: Concepts and Techniques (3rd Edition)",
        "isbn": "978-0123814791",
        "authors": ["Jiawei Han", "Micheline Kamber", "Jian Pei"],
        "category": "Computer Science & Information Technology",
        "publisher": "Morgan Kaufmann",
        "year": 2012,
        "edition": "3rd Edition",
        "call_number": "006.312 HAN 2012",
        "shelf_location": "Rack CS-07, Shelf 3",
        "description": "Data preprocessing, association rule mining, decision trees, cluster analysis, outlier detection, and multidimensional data warehousing."
    },
    {
        "title": "Cryptography and Network Security: Principles and Practice (8th Edition)",
        "isbn": "978-0135764039",
        "authors": ["William Stallings"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson",
        "year": 2020,
        "edition": "8th Edition",
        "call_number": "005.8 STA 2020",
        "shelf_location": "Rack CS-08, Shelf 1",
        "description": "Symmetric encryption (AES, DES), asymmetric ciphers (RSA, ECC), hash functions, digital signatures, wireless security, and IPsec."
    },
    {
        "title": "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (3rd Edition)",
        "isbn": "978-1098125974",
        "authors": ["Aurélien Géron"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2022,
        "edition": "3rd Edition",
        "call_number": "006.31 GER 2022",
        "shelf_location": "Rack CS-08, Shelf 2",
        "description": "End-to-end machine learning project lifecycle, linear regression, SVMs, random forests, deep neural networks, and transformer architectures."
    },
    {
        "title": "Cloud Computing: Concepts, Technology & Architecture",
        "isbn": "978-0133387520",
        "authors": ["Thomas Erl", "Zaigham Mahmood", "Ricardo Puttini"],
        "category": "Computer Science & Information Technology",
        "publisher": "Prentice Hall",
        "year": 2019,
        "edition": "1st Edition",
        "call_number": "004.678 ERL 2019",
        "shelf_location": "Rack CS-08, Shelf 3",
        "description": "Foundational cloud mechanisms, IaaS, PaaS, SaaS architectures, virtualization, multitenancy, and cloud security frameworks."
    },
    {
        "title": "Natural Language Processing with Transformers (Revised Edition)",
        "isbn": "978-1098136796",
        "authors": ["Lewis Tunstall", "Leandro von Werra", "Thomas Wolf"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2022,
        "edition": "Revised Edition",
        "call_number": "006.35 TUN 2022",
        "shelf_location": "Rack CS-09, Shelf 1",
        "description": "Hugging Face transformers, BERT, GPT, tokenization, text classification, named entity recognition, and question answering systems."
    },
    {
        "title": "Discrete Mathematics and Its Applications (8th Edition)",
        "isbn": "978-1259676512",
        "authors": ["Kenneth H. Rosen"],
        "category": "Computer Science & Information Technology",
        "publisher": "McGraw-Hill",
        "year": 2019,
        "edition": "8th Edition",
        "call_number": "511.1 ROS 2019",
        "shelf_location": "Rack CS-09, Shelf 2",
        "description": "Propositional logic, predicate calculus, sets, relations, graphs, trees, combinatorics, and proof techniques essential for computing students."
    },
    {
        "title": "Mobile App Development with Flutter (2nd Edition)",
        "isbn": "978-1801815529",
        "authors": ["Marco L. Napoli"],
        "category": "Computer Science & Information Technology",
        "publisher": "Packt Publishing",
        "year": 2022,
        "edition": "2nd Edition",
        "call_number": "005.25 NAP 2022",
        "shelf_location": "Rack CS-09, Shelf 3",
        "description": "Cross-platform mobile applications using Dart and Google Flutter, state management, widget composition, RESTful API integration, and SQLite."
    },
    {
        "title": "C++ Primer (5th Edition)",
        "isbn": "978-0321714114",
        "authors": ["Stanley B. Lippman", "Josée Lajoie", "Barbara E. Moo"],
        "category": "Computer Science & Information Technology",
        "publisher": "Addison-Wesley",
        "year": 2017,
        "edition": "5th Edition",
        "call_number": "005.133 LIP 2017",
        "shelf_location": "Rack CS-10, Shelf 1",
        "description": "Comprehensive reference to modern C++11 standard, standard template library (STL), object-oriented design, and memory pointers."
    },
    {
        "title": "Java: The Complete Reference (12th Edition)",
        "isbn": "978-1260463415",
        "authors": ["Herbert Schildt"],
        "category": "Computer Science & Information Technology",
        "publisher": "McGraw-Hill",
        "year": 2021,
        "edition": "12th Edition",
        "call_number": "005.133 SCH 2021",
        "shelf_location": "Rack CS-10, Shelf 2",
        "description": "Authoritative guide to Java SE 17, syntax, multithreading, collections framework, lambda expressions, streams, and networking APIs."
    },
    {
        "title": "High Performance Browser Networking",
        "isbn": "978-1449344764",
        "authors": ["Ilya Grigorik"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2016,
        "edition": "1st Edition",
        "call_number": "004.6 GRI 2016",
        "shelf_location": "Rack CS-10, Shelf 3",
        "description": "Optimizing TCP, UDP, TLS performance, HTTP/2, HTTP/3, WebSocket, and WebRTC protocols for fast web applications."
    },
    {
        "title": "Site Reliability Engineering: How Google Runs Production Systems",
        "isbn": "978-1491929124",
        "authors": ["Betsy Beyer", "Chris Jones", "Jennifer Petoff", "Niall Richard Murphy"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2016,
        "edition": "1st Edition",
        "call_number": "005.1 BEY 2016",
        "shelf_location": "Rack CS-11, Shelf 1",
        "description": "Practices for building and maintaining resilient distributed architectures, service level objectives (SLOs), error budgets, and incident management."
    },
    {
        "title": "Linux Kernel Development (3rd Edition)",
        "isbn": "978-0672329463",
        "authors": ["Robert Love"],
        "category": "Computer Science & Information Technology",
        "publisher": "Addison-Wesley",
        "year": 2018,
        "edition": "3rd Edition",
        "call_number": "005.432 LOV 2018",
        "shelf_location": "Rack CS-11, Shelf 2",
        "description": "Kernel architecture, process scheduling, memory allocation, virtual file system, interrupts, kernel synchronization, and driver interfaces."
    },
    {
        "title": "Web Application Security: Exploitation and Countermeasures",
        "isbn": "978-1492053705",
        "authors": ["Andrew Hoffman"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2020,
        "edition": "1st Edition",
        "call_number": "005.8 HOF 2020",
        "shelf_location": "Rack CS-11, Shelf 3",
        "description": "OWASP Top 10 vulnerabilities, XSS, CSRF, SQL injection mitigation, subresource integrity, and defense-in-depth architecture."
    },
    {
        "title": "Human-Computer Interaction (3rd Edition)",
        "isbn": "978-0130461094",
        "authors": ["Alan Dix", "Janet Finlay", "Gregory D. Abowd", "Russell Beale"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson Education",
        "year": 2015,
        "edition": "3rd Edition",
        "call_number": "004.019 DIX 2015",
        "shelf_location": "Rack CS-12, Shelf 1",
        "description": "Principles of user experience design, cognitive models, heuristic evaluation, accessibility, and interaction design."
    },
    {
        "title": "Distributed Systems: Principles and Paradigms (3rd Edition)",
        "isbn": "978-1543057386",
        "authors": ["Andrew S. Tanenbaum", "Maarten van Steen"],
        "category": "Computer Science & Information Technology",
        "publisher": "CreateSpace Independent Publishing",
        "year": 2017,
        "edition": "3rd Edition",
        "call_number": "004.36 TAN 2017",
        "shelf_location": "Rack CS-12, Shelf 2",
        "description": "Communication protocols, remote procedure calls, naming, distributed synchronization, consistency models, and fault tolerance."
    },
    {
        "title": "The Pragmatic Programmer: Your Journey to Mastery (20th Anniversary Edition)",
        "isbn": "978-0135957059",
        "authors": ["David Thomas", "Andrew Hunt"],
        "category": "Computer Science & Information Technology",
        "publisher": "Addison-Wesley",
        "year": 2019,
        "edition": "20th Anniversary Edition",
        "call_number": "005.1 THO 2019",
        "shelf_location": "Rack CS-12, Shelf 3",
        "description": "Classic wisdom on career development, software responsibility, decoupling, automation, and pragmatic team collaboration."
    },
    {
        "title": "Kubernetes: Up and Running (3rd Edition)",
        "isbn": "978-1098110208",
        "authors": ["Brendan Burns", "Joe Beda", "Kelsey Hightower", "Lachlan Evenson"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2022,
        "edition": "3rd Edition",
        "call_number": "004.36 BUR 2022",
        "shelf_location": "Rack CS-13, Shelf 1",
        "description": "Container orchestration with Kubernetes, deployments, services, ingress controllers, persistent volumes, and cluster operations."
    },
    {
        "title": "Microservices Patterns: With examples in Java",
        "isbn": "978-1617294549",
        "authors": ["Chris Richardson"],
        "category": "Computer Science & Information Technology",
        "publisher": "Manning Publications",
        "year": 2018,
        "edition": "1st Edition",
        "call_number": "005.1 RIC 2018",
        "shelf_location": "Rack CS-13, Shelf 2",
        "description": "Decomposing monolithic architectures, saga pattern, event sourcing, CQRS, API gateway design, and transactional messaging."
    },
    {
        "title": "Learning SQL: Generate, Manipulate, and Retrieve Data (3rd Edition)",
        "isbn": "978-1492057611",
        "authors": ["Alan Beaulieu"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2020,
        "edition": "3rd Edition",
        "call_number": "005.756 BEA 2020",
        "shelf_location": "Rack CS-13, Shelf 3",
        "description": "Hands-on mastery of relational querying, joins, aggregate functions, window functions, views, and index optimization."
    },
    {
        "title": "Introduction to Automata Theory, Languages, and Computation",
        "isbn": "978-0321455369",
        "authors": ["John E. Hopcroft", "Rajeev Motwani", "Jeffrey D. Ullman"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson Education",
        "year": 2015,
        "edition": "3rd Edition",
        "call_number": "511.3 HOP 2015",
        "shelf_location": "Rack CS-14, Shelf 1",
        "description": "Rigorous treatment of finite automata, pushdown automata, Pumping Lemma, context-free languages, and Chomsky hierarchy."
    },
    {
        "title": "Cybersecurity Essentials",
        "isbn": "978-1119362395",
        "authors": ["Charles J. Brooks", "Christopher Grow", "Philip Craig", "Donald Short"],
        "category": "Computer Science & Information Technology",
        "publisher": "Sybex / Wiley",
        "year": 2018,
        "edition": "1st Edition",
        "call_number": "005.8 BRO 2018",
        "shelf_location": "Rack CS-14, Shelf 2",
        "description": "Fundamentals of securing infrastructure, threat models, risk management frameworks, authentication protocols, and vulnerability auditing."
    },
    {
        "title": "Graph Algorithms: Practical Examples in Apache Spark & Neo4j",
        "isbn": "978-1492047681",
        "authors": ["Mark Needham", "Amy E. Hodler"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2019,
        "edition": "1st Edition",
        "call_number": "005.1 NEE 2019",
        "shelf_location": "Rack CS-14, Shelf 3",
        "description": "Pathfinding, centrality, PageRank, community detection, and topological graph traversal for connected data applications."
    },
    {
        "title": "Internet of Things: A Hands-On Approach",
        "isbn": "978-0996025515",
        "authors": ["Arshdeep Bahga", "Vijay Madisetti"],
        "category": "Computer Science & Information Technology",
        "publisher": "Universities Press",
        "year": 2016,
        "edition": "1st Edition",
        "call_number": "004.678 BAH 2016",
        "shelf_location": "Rack CS-15, Shelf 1",
        "description": "IoT architecture, sensor interfacing with Raspberry Pi and Arduino, MQTT, CoAP, and cloud analytics integration."
    },
    {
        "title": "Modern Information Retrieval: The Concepts and Technology Behind Search",
        "isbn": "978-0321416919",
        "authors": ["Ricardo Baeza-Yates", "Berthier Ribeiro-Neto"],
        "category": "Computer Science & Information Technology",
        "publisher": "Addison-Wesley",
        "year": 2014,
        "edition": "2nd Edition",
        "call_number": "025.04 BAE 2014",
        "shelf_location": "Rack CS-15, Shelf 2",
        "description": "Inverted indexing, vector space models, probabilistic ranking, BM25, web crawling, and evaluation of search engines."
    },
    {
        "title": "Speech and Language Processing (3rd Edition Draft)",
        "isbn": "978-0131873216",
        "authors": ["Daniel Jurafsky", "James H. Martin"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson Prentice Hall",
        "year": 2023,
        "edition": "3rd International Edition",
        "call_number": "006.35 JUR 2023",
        "shelf_location": "Rack CS-15, Shelf 3",
        "description": "Comprehensive reference on computational linguistics, neural language models, syntactic parsing, semantic roles, and speech synthesis."
    },
    {
        "title": "Programming Rust: Fast, Safe Systems Development (2nd Edition)",
        "isbn": "978-1492052593",
        "authors": ["Jim Blandy", "Jason Orendorff", "Leonora F. S. Tindall"],
        "category": "Computer Science & Information Technology",
        "publisher": "O'Reilly Media",
        "year": 2021,
        "edition": "2nd Edition",
        "call_number": "005.133 BLA 2021",
        "shelf_location": "Rack CS-16, Shelf 1",
        "description": "Memory safety without garbage collection, borrow checker, ownership semantics, concurrency, and traits in the Rust programming language."
    },
    {
        "title": "Data Structures and Algorithm Analysis in C++ (4th Edition)",
        "isbn": "978-0132847377",
        "authors": ["Mark Allen Weiss"],
        "category": "Computer Science & Information Technology",
        "publisher": "Pearson",
        "year": 2015,
        "edition": "4th Edition",
        "call_number": "005.133 WEI 2015",
        "shelf_location": "Rack CS-16, Shelf 2",
        "description": "Advanced tree structures, splay trees, priority queues, hashing, sorting algorithms, and amortized complexity analysis."
    },

    # --- 2. MATHEMATICS & STATISTICS (35 Books) ---
    {
        "title": "Thomas' Calculus: Early Transcendentals (14th Edition)",
        "isbn": "978-0134439020",
        "authors": ["Joel R. Hass", "Christopher E. Heil", "Maurice D. Weir"],
        "category": "Mathematics & Statistics",
        "publisher": "Pearson",
        "year": 2018,
        "edition": "14th Edition",
        "call_number": "515 HAS 2018",
        "shelf_location": "Rack MS-01, Shelf 1",
        "description": "Standard university calculus covering limits, derivatives, integrals, vector calculus, Greens and Stokes theorems."
    },
    {
        "title": "Linear Algebra and Its Applications (5th Edition)",
        "isbn": "978-0321982384",
        "authors": ["David C. Lay", "Steven R. Lay", "Judi J. McDonald"],
        "category": "Mathematics & Statistics",
        "publisher": "Pearson",
        "year": 2016,
        "edition": "5th Edition",
        "call_number": "512.5 LAY 2016",
        "shelf_location": "Rack MS-01, Shelf 2",
        "description": "Vector spaces, linear transformations, matrix inverses, eigenvalues, eigenvectors, orthogonal projections, and SVD decomposition."
    },
    {
        "title": "Introduction to Probability Models (12th Edition)",
        "isbn": "978-0128143469",
        "authors": ["Sheldon M. Ross"],
        "category": "Mathematics & Statistics",
        "publisher": "Academic Press",
        "year": 2019,
        "edition": "12th Edition",
        "call_number": "519.2 ROS 2019",
        "shelf_location": "Rack MS-01, Shelf 3",
        "description": "Markov chains, Poisson processes, renewal theory, queueing theory, and simulation models for science and engineering students."
    },
    {
        "title": "Probability and Statistics for Engineering and the Sciences (9th Edition)",
        "isbn": "978-1305251809",
        "authors": ["Jay L. Devore"],
        "category": "Mathematics & Statistics",
        "publisher": "Cengage Learning",
        "year": 2016,
        "edition": "9th Edition",
        "call_number": "519.5 DEV 2016",
        "shelf_location": "Rack MS-02, Shelf 1",
        "description": "Descriptive statistics, point and interval estimation, hypothesis testing, ANOVA, simple and multiple regression analysis."
    },
    {
        "title": "Principles of Mathematical Analysis (Baby Rudin)",
        "isbn": "978-0070542358",
        "authors": ["Walter Rudin"],
        "category": "Mathematics & Statistics",
        "publisher": "McGraw-Hill",
        "year": 2014,
        "edition": "3rd Edition",
        "call_number": "515 RUD 2014",
        "shelf_location": "Rack MS-02, Shelf 2",
        "description": "The golden standard for real analysis: metric spaces, numerical sequences, continuity, Riemann-Stieltjes integration, and uniform convergence."
    },
    {
        "title": "Elementary Differential Equations and Boundary Value Problems (11th Edition)",
        "isbn": "978-1119256083",
        "authors": ["William E. Boyce", "Richard C. DiPrima", "Douglas B. Meade"],
        "category": "Mathematics & Statistics",
        "publisher": "Wiley",
        "year": 2017,
        "edition": "11th Edition",
        "call_number": "515.35 BOY 2017",
        "shelf_location": "Rack MS-02, Shelf 3",
        "description": "First-order ODEs, linear systems of differential equations, Laplace transforms, Fourier series, and partial differential equations."
    },
    {
        "title": "Complex Variables and Applications (9th Edition)",
        "isbn": "978-0073383170",
        "authors": ["James Ward Brown", "Ruel V. Churchill"],
        "category": "Mathematics & Statistics",
        "publisher": "McGraw-Hill",
        "year": 2014,
        "edition": "9th Edition",
        "call_number": "515.9 BRO 2014",
        "shelf_location": "Rack MS-03, Shelf 1",
        "description": "Analytic functions, Cauchy-Riemann equations, contour integration, Cauchy integral formula, Laurent series, and residue calculus."
    },
    {
        "title": "Numerical Analysis (10th Edition)",
        "isbn": "978-1305253667",
        "authors": ["Richard L. Burden", "J. Douglas Faires", "Annette M. Burden"],
        "category": "Mathematics & Statistics",
        "publisher": "Cengage Learning",
        "year": 2016,
        "edition": "10th Edition",
        "call_number": "518 BUR 2016",
        "shelf_location": "Rack MS-03, Shelf 2",
        "description": "Root finding, polynomial interpolation, numerical differentiation and integration, initial-value problems for ODEs, and matrix eigenvalues."
    },
    {
        "title": "A First Course in Abstract Algebra (8th Edition)",
        "isbn": "978-0136731627",
        "authors": ["John B. Fraleigh", "Neal Brand"],
        "category": "Mathematics & Statistics",
        "publisher": "Pearson",
        "year": 2021,
        "edition": "8th Edition",
        "call_number": "512.02 FRA 2021",
        "shelf_location": "Rack MS-03, Shelf 3",
        "description": "Introductory abstract algebra: groups, subgroups, permutation groups, cosets, homomorphisms, rings, integral domains, and fields."
    },
    {
        "title": "Mathematical Statistics with Applications (7th Edition)",
        "isbn": "978-0495110811",
        "authors": ["Dennis Wackerly", "William Mendenhall", "Richard L. Scheaffer"],
        "category": "Mathematics & Statistics",
        "publisher": "Cengage Learning",
        "year": 2014,
        "edition": "7th Edition",
        "call_number": "519.5 WAC 2014",
        "shelf_location": "Rack MS-04, Shelf 1",
        "description": "Theory of statistical estimation, maximum likelihood, Neyman-Pearson lemma, likelihood ratio tests, and non-parametric statistics."
    },
    {
        "title": "Applied Multivariate Statistical Analysis (6th Edition)",
        "isbn": "978-0131877153",
        "authors": ["Richard A. Johnson", "Dean W. Wichern"],
        "category": "Mathematics & Statistics",
        "publisher": "Pearson",
        "year": 2015,
        "edition": "6th Edition",
        "call_number": "519.535 JOH 2015",
        "shelf_location": "Rack MS-04, Shelf 2",
        "description": "Multivariate normal distribution, MANOVA, principal component analysis (PCA), factor analysis, discriminant analysis, and clustering."
    },
    {
        "title": "Time Series Analysis: With Applications in R (2nd Edition)",
        "isbn": "978-0387759586",
        "authors": ["Jonathan D. Cryer", "Kung-Sik Chan"],
        "category": "Mathematics & Statistics",
        "publisher": "Springer",
        "year": 2014,
        "edition": "2nd Edition",
        "call_number": "519.55 CRY 2014",
        "shelf_location": "Rack MS-04, Shelf 3",
        "description": "Autoregressive (AR), moving average (MA), ARIMA models, seasonal models, spectral analysis, and forecasting with R."
    },
    {
        "title": "Operations Research: An Introduction (10th Edition)",
        "isbn": "978-0134444017",
        "authors": ["Hamdy A. Taha"],
        "category": "Mathematics & Statistics",
        "publisher": "Pearson",
        "year": 2017,
        "edition": "10th Edition",
        "call_number": "003 TAH 2017",
        "shelf_location": "Rack MS-05, Shelf 1",
        "description": "Linear programming simplex method, duality, transportation models, integer programming, dynamic programming, and inventory control."
    },
    {
        "title": "Introduction to Topology and Modern Analysis",
        "isbn": "978-0070575486",
        "authors": ["George F. Simmons"],
        "category": "Mathematics & Statistics",
        "publisher": "McGraw-Hill",
        "year": 2013,
        "edition": "Classic Reissue",
        "call_number": "514 SIM 2013",
        "shelf_location": "Rack MS-05, Shelf 2",
        "description": "Topological spaces, compactness, connectedness, Banach spaces, Hilbert spaces, and Banach algebras."
    },
    {
        "title": "Graph Theory with Applications to Engineering and Computer Science",
        "isbn": "978-0486807935",
        "authors": ["Narsingh Deo"],
        "category": "Mathematics & Statistics",
        "publisher": "Dover Publications",
        "year": 2016,
        "edition": "Dover Edition",
        "call_number": "511.5 DEO 2016",
        "shelf_location": "Rack MS-05, Shelf 3",
        "description": "Paths, circuits, trees, planar graphs, vector spaces of graphs, matrix representations, and graph algorithms."
    },

    # --- 3. BIOLOGICAL SCIENCES & BIOTECHNOLOGY (30 Books) ---
    {
        "title": "Campbell Biology (12th Edition)",
        "isbn": "978-0135188743",
        "authors": ["Lisa A. Urry", "Michael L. Cain", "Steven A. Wasserman", "Peter V. Minorsky"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "Pearson",
        "year": 2021,
        "edition": "12th Edition",
        "call_number": "570 URR 2021",
        "shelf_location": "Rack BS-01, Shelf 1",
        "description": "The benchmark international textbook for undergraduate biological sciences, covering evolution, cellular biochemistry, and ecosystems."
    },
    {
        "title": "Molecular Biology of the Cell (6th Edition)",
        "isbn": "978-0815344322",
        "authors": ["Bruce Alberts", "Alexander Johnson", "Julian Lewis", "David Morgan"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "Garland Science",
        "year": 2015,
        "edition": "6th Edition",
        "call_number": "571.6 ALB 2015",
        "shelf_location": "Rack BS-01, Shelf 2",
        "description": "Definitive guide to cellular mechanics, DNA replication, transcriptional control, cell cycle checkpoints, apoptosis, and tissue homeostasis."
    },
    {
        "title": "Lehninger Principles of Biochemistry (8th Edition)",
        "isbn": "978-1319228002",
        "authors": ["David L. Nelson", "Michael M. Cox"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "W. H. Freeman",
        "year": 2021,
        "edition": "8th Edition",
        "call_number": "572 NEL 2021",
        "shelf_location": "Rack BS-01, Shelf 3",
        "description": "Biomolecular structures, enzyme kinetics, glycolysis, Krebs cycle, oxidative phosphorylation, lipid metabolism, and signal transduction."
    },
    {
        "title": "Prescott's Microbiology (11th Edition)",
        "isbn": "978-1260211887",
        "authors": ["Joanne Willey", "Kathleen Sandman", "Dorothy Wood"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "McGraw-Hill",
        "year": 2020,
        "edition": "11th Edition",
        "call_number": "579 WIL 2020",
        "shelf_location": "Rack BS-02, Shelf 1",
        "description": "Microbial world, bacterial cell structure, viral replication, microbial growth, pathogenesis, antimicrobial resistance, and biotechnology."
    },
    {
        "title": "Plant Physiology and Development (6th Edition)",
        "isbn": "978-1605353265",
        "authors": ["Lincoln Taiz", "Eduardo Zeiger", "Ian M. Møller", "Angus Murphy"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "Sinauer Associates / Oxford University Press",
        "year": 2015,
        "edition": "6th Edition",
        "call_number": "571.2 TAI 2015",
        "shelf_location": "Rack BS-02, Shelf 2",
        "description": "Water transport in xylem, stomatal opening, photosynthesis C3/C4 pathways, phytohormones (auxins, cytokinins, ethylene), and photoperiodism."
    },
    {
        "title": "Ecology: Concepts and Applications (8th Edition)",
        "isbn": "978-1260085204",
        "authors": ["Manuel C. Molles", "Anna A. Sher"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "McGraw-Hill",
        "year": 2019,
        "edition": "8th Edition",
        "call_number": "577 MOL 2019",
        "shelf_location": "Rack BS-02, Shelf 3",
        "description": "Terrestrial and aquatic biomes, population dynamics, community structure, nutrient cycling, succession, and conservation biology in the tropics."
    },
    {
        "title": "Invertebrate Zoology: A Functional Evolutionary Approach",
        "isbn": "978-0030259821",
        "authors": ["Edward E. Ruppert", "Richard S. Fox", "Robert D. Barnes"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "Cengage Learning",
        "year": 2014,
        "edition": "7th Edition",
        "call_number": "592 RUP 2014",
        "shelf_location": "Rack BS-03, Shelf 1",
        "description": "Functional morphology, phylogenetic relationships, and physiology of major invertebrate phyla from protozoa to arthropods."
    },
    {
        "title": "Vertebrate Life (10th Edition)",
        "isbn": "978-1605356075",
        "authors": ["F. Harvey Pough", "Christine M. Janis"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "Sinauer Associates / Oxford",
        "year": 2018,
        "edition": "10th Edition",
        "call_number": "596 POU 2018",
        "shelf_location": "Rack BS-03, Shelf 2",
        "description": "Evolutionary radiation of chordates, comparative vertebrate anatomy, physiological adaptations to terrestrial living, and mammalian lineage."
    },
    {
        "title": "Genetics: From Genes to Genomes (7th Edition)",
        "isbn": "978-1260240894",
        "authors": ["Leland Hartwell", "Michael L. Goldberg", "Janice Fischer"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "McGraw-Hill",
        "year": 2021,
        "edition": "7th Edition",
        "call_number": "576.5 HAR 2021",
        "shelf_location": "Rack BS-03, Shelf 3",
        "description": "Mendelian inheritance, linkage mapping, gene expression regulation, CRISPR-Cas9 genome editing, and modern genomic medicine."
    },
    {
        "title": "Biotechnology: An Introduction (3rd Edition)",
        "isbn": "978-1111521998",
        "authors": ["Susan R. Barnum"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "Brooks/Cole",
        "year": 2013,
        "edition": "3rd Edition",
        "call_number": "660.6 BAR 2013",
        "shelf_location": "Rack BS-04, Shelf 1",
        "description": "Recombinant DNA technology, transgenic agriculture, plant tissue culture, industrial fermentation, biosafety regulations, and bioethics."
    },
    {
        "title": "The Diversity of Life in Sri Lanka: Biodiversity Flora & Fauna",
        "isbn": "978-9559034452",
        "authors": ["C. N. B. Bambaradeniya", "Devaka Weerakoon"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "IUCN Sri Lanka & Ministry of Environment",
        "year": 2016,
        "edition": "Special Monograph",
        "call_number": "574.954 BAM 2016",
        "shelf_location": "Rack BS-04, Shelf 2",
        "description": "Comprehensive documentation of endemic flora, herpetofauna, avifauna, and dry-zone aquatic ecosystems in the Northern and Eastern provinces."
    },
    {
        "title": "Environmental Science: Earth as a Living Planet (9th Edition)",
        "isbn": "978-1118427323",
        "authors": ["Daniel B. Botkin", "Edward A. Keller"],
        "category": "Biological Sciences & Biotechnology",
        "publisher": "Wiley",
        "year": 2014,
        "edition": "9th Edition",
        "call_number": "363.7 BOT 2014",
        "shelf_location": "Rack BS-04, Shelf 3",
        "description": "Global climate change, biogeochemical cycles, agro-ecosystem preservation, renewable water supplies, and sustainable environmental policy."
    },

    # --- 4. PHYSICAL SCIENCES & CHEMISTRY (25 Books) ---
    {
        "title": "Fundamentals of Physics (11th Edition)",
        "isbn": "978-1119286240",
        "authors": ["David Halliday", "Robert Resnick", "Jearl Walker"],
        "category": "Physical Sciences & Chemistry",
        "publisher": "Wiley",
        "year": 2018,
        "edition": "11th Edition",
        "call_number": "530 HAL 2018",
        "shelf_location": "Rack PS-01, Shelf 1",
        "description": "Comprehensive foundation in classical mechanics, wave motion, thermodynamics, electromagnetism, and optics for physical science students."
    },
    {
        "title": "Introduction to Electrodynamics (4th Edition)",
        "isbn": "978-0321856562",
        "authors": ["David J. Griffiths"],
        "category": "Physical Sciences & Chemistry",
        "publisher": "Pearson",
        "year": 2013,
        "edition": "4th Edition",
        "call_number": "537.6 GRI 2013",
        "shelf_location": "Rack PS-01, Shelf 2",
        "description": "Vector analysis, electrostatics, Laplace's equation, magnetostatics, Maxwell's equations, and electromagnetic wave propagation."
    },
    {
        "title": "Introduction to Quantum Mechanics (3rd Edition)",
        "isbn": "978-1107189638",
        "authors": ["David J. Griffiths", "Darrell F. Schroeter"],
        "category": "Physical Sciences & Chemistry",
        "publisher": "Cambridge University Press",
        "year": 2018,
        "edition": "3rd Edition",
        "call_number": "530.12 GRI 2018",
        "shelf_location": "Rack PS-01, Shelf 3",
        "description": "The Schrodinger equation, bound states, harmonic oscillator, angular momentum, hydrogen atom, time-independent perturbation theory."
    },
    {
        "title": "Organic Chemistry (9th Edition)",
        "isbn": "978-0321971371",
        "authors": ["Leroy G. Wade", "Jan William Simek"],
        "category": "Physical Sciences & Chemistry",
        "publisher": "Pearson",
        "year": 2017,
        "edition": "9th Edition",
        "call_number": "547 WAD 2017",
        "shelf_location": "Rack PS-02, Shelf 1",
        "description": "Reaction mechanisms, stereochemistry, electrophilic aromatic substitution, carbonyl condensations, NMR and IR spectroscopy."
    },
    {
        "title": "Inorganic Chemistry (5th Edition)",
        "isbn": "978-0321811059",
        "authors": ["Gary L. Miessler", "Paul J. Fischer", "Donald A. Tarr"],
        "category": "Physical Sciences & Chemistry",
        "publisher": "Pearson",
        "year": 2014,
        "edition": "5th Edition",
        "call_number": "546 MIE 2014",
        "shelf_location": "Rack PS-02, Shelf 2",
        "description": "Molecular symmetry, group theory, crystal field theory, organometallic chemistry, ligand substitution, and bioinorganic catalytic centers."
    },
    {
        "title": "Atkins' Physical Chemistry (11th Edition)",
        "isbn": "978-0198769865",
        "authors": ["Peter Atkins", "Julio de Paula", "James Keeler"],
        "category": "Physical Sciences & Chemistry",
        "publisher": "Oxford University Press",
        "year": 2018,
        "edition": "11th Edition",
        "call_number": "541 ATK 2018",
        "shelf_location": "Rack PS-02, Shelf 3",
        "description": "Thermodynamics laws, chemical equilibrium, phase diagrams, electrochemistry, quantum chemistry, and chemical reaction dynamics."
    },
    {
        "title": "Modern Spectroscopy (4th Edition)",
        "isbn": "978-0470014363",
        "authors": ["J. Michael Hollas"],
        "category": "Physical Sciences & Chemistry",
        "publisher": "Wiley",
        "year": 2015,
        "edition": "4th Edition",
        "call_number": "543.085 HOL 2015",
        "shelf_location": "Rack PS-03, Shelf 1",
        "description": "Rotational, vibrational, Raman, electronic, and photoelectron spectroscopy principles applied to structural chemical determination."
    },

    # --- 5. BUSINESS STUDIES & MANAGEMENT (40 Books) ---
    {
        "title": "Principles of Management (OpenStax Core Text)",
        "isbn": "978-1947172890",
        "authors": ["David S. Bright", "Anastasia H. Cortes"],
        "category": "Business Studies & Management",
        "publisher": "OpenStax • Rice University",
        "year": 2021,
        "edition": "Academic Edition",
        "call_number": "658 BRI 2021",
        "shelf_location": "Rack MGT-01, Shelf 1",
        "description": "Core administrative functions: planning, organizing, leading, motivating staff, conflict resolution, and change management."
    },
    {
        "title": "Marketing Management (16th Global Edition)",
        "isbn": "978-0135887158",
        "authors": ["Philip Kotler", "Kevin Lane Keller", "Alexander Chernev"],
        "category": "Business Studies & Management",
        "publisher": "Pearson",
        "year": 2022,
        "edition": "16th Edition",
        "call_number": "658.8 KOT 2022",
        "shelf_location": "Rack MGT-01, Shelf 2",
        "description": "The gold-standard marketing reference: customer segmentation, brand equity, digital consumer journey, pricing strategies, and omnichannel distribution."
    },
    {
        "title": "Strategic Management: Concepts and Cases (13th Edition)",
        "isbn": "978-0357033838",
        "authors": ["Michael A. Hitt", "R. Duane Ireland", "Robert E. Hoskisson"],
        "category": "Business Studies & Management",
        "publisher": "Cengage Learning",
        "year": 2020,
        "edition": "13th Edition",
        "call_number": "658.4012 HIT 2020",
        "shelf_location": "Rack MGT-01, Shelf 3",
        "description": "Competitive dynamics, SWOT analysis, resource-based view, diversification, corporate governance, and global competitive strategy."
    },
    {
        "title": "Human Resource Management (16th Edition)",
        "isbn": "978-0135172780",
        "authors": ["Gary Dessler"],
        "category": "Business Studies & Management",
        "publisher": "Pearson",
        "year": 2020,
        "edition": "16th Edition",
        "call_number": "658.3 DES 2020",
        "shelf_location": "Rack MGT-02, Shelf 1",
        "description": "Recruitment, talent acquisition, employee onboarding, performance appraisals, compensation structures, labor relations, and occupational health."
    },
    {
        "title": "Organizational Behavior (18th Edition)",
        "isbn": "978-0134729329",
        "authors": ["Stephen P. Robbins", "Timothy A. Judge"],
        "category": "Business Studies & Management",
        "publisher": "Pearson",
        "year": 2019,
        "edition": "18th Edition",
        "call_number": "658.3 ROB 2019",
        "shelf_location": "Rack MGT-02, Shelf 2",
        "description": "Personality traits, job satisfaction, leadership theories, team dynamics, power and organizational politics, and organizational culture."
    },
    {
        "title": "Entrepreneurship: Successfully Launching New Ventures (6th Edition)",
        "isbn": "978-0134729534",
        "authors": ["Bruce R. Barringer", "R. Duane Ireland"],
        "category": "Business Studies & Management",
        "publisher": "Pearson",
        "year": 2019,
        "edition": "6th Edition",
        "call_number": "658.421 BAR 2019",
        "shelf_location": "Rack MGT-02, Shelf 3",
        "description": "Opportunity recognition, business model canvas, feasibility analysis, pitching venture capitalists, and scaling startups in emerging markets."
    },
    {
        "title": "Operations Management: Sustainability and Supply Chain (13th Edition)",
        "isbn": "978-0135225899",
        "authors": ["Jay Heizer", "Barry Render", "Chuck Munson"],
        "category": "Business Studies & Management",
        "publisher": "Pearson",
        "year": 2020,
        "edition": "13th Edition",
        "call_number": "658.5 HEI 2020",
        "shelf_location": "Rack MGT-03, Shelf 1",
        "description": "Process design, capacity planning, supply chain logistics, total quality management (TQM), just-in-time (JIT), and inventory control."
    },
    {
        "title": "Project Management: A Systems Approach to Planning, Scheduling, and Controlling (12th Edition)",
        "isbn": "978-1119165354",
        "authors": ["Harold Kerzner"],
        "category": "Business Studies & Management",
        "publisher": "Wiley",
        "year": 2017,
        "edition": "12th Edition",
        "call_number": "658.404 KER 2017",
        "shelf_location": "Rack MGT-03, Shelf 2",
        "description": "Work breakdown structures (WBS), Gantt charts, CPM/PERT network analysis, earned value management (EVM), and risk mitigation."
    },
    {
        "title": "Consumer Behavior: Buying, Having, and Being (13th Edition)",
        "isbn": "978-0135200100",
        "authors": ["Michael R. Solomon"],
        "category": "Business Studies & Management",
        "publisher": "Pearson",
        "year": 2020,
        "edition": "13th Edition",
        "call_number": "658.834 SOL 2020",
        "shelf_location": "Rack MGT-03, Shelf 3",
        "description": "Perception, learning, attitudes, social influences, digital subcultures, and ethical consumerism in global marketing environments."
    },

    # --- 6. ACCOUNTING & FINANCIAL ECONOMICS (25 Books) ---
    {
        "title": "Financial Accounting (11th Edition)",
        "isbn": "978-0135189702",
        "authors": ["Walter T. Harrison", "Charles T. Horngren", "C. William Thomas"],
        "category": "Accounting & Financial Economics",
        "publisher": "Pearson",
        "year": 2019,
        "edition": "11th Edition",
        "call_number": "657.48 HAR 2019",
        "shelf_location": "Rack ACC-01, Shelf 1",
        "description": "Accounting equation, double-entry bookkeeping, accruals, preparation of balance sheets, income statements, and cash flows."
    },
    {
        "title": "Cost Accounting: A Managerial Emphasis (16th Edition)",
        "isbn": "978-0134475585",
        "authors": ["Srikant M. Datar", "Madhav V. Rajan"],
        "category": "Accounting & Financial Economics",
        "publisher": "Pearson",
        "year": 2018,
        "edition": "16th Edition",
        "call_number": "658.155 DAT 2018",
        "shelf_location": "Rack ACC-01, Shelf 2",
        "description": "Job costing, activity-based costing (ABC), cost-volume-profit (CVP) analysis, variance analysis, and transfer pricing models."
    },
    {
        "title": "Corporate Finance (5th Global Edition)",
        "isbn": "978-0135161081",
        "authors": ["Jonathan Berk", "Peter DeMarzo"],
        "category": "Accounting & Financial Economics",
        "publisher": "Pearson",
        "year": 2020,
        "edition": "5th Edition",
        "call_number": "658.15 BER 2020",
        "shelf_location": "Rack ACC-01, Shelf 3",
        "description": "Time value of money, net present value (NPV), capital budgeting, cost of capital, dividend policy, capital structure, and Modigliani-Miller theorems."
    },
    {
        "title": "Principles of Microeconomics (9th Edition)",
        "isbn": "978-0357133484",
        "authors": ["N. Gregory Mankiw"],
        "category": "Accounting & Financial Economics",
        "publisher": "Cengage Learning",
        "year": 2021,
        "edition": "9th Edition",
        "call_number": "338.5 MAN 2021",
        "shelf_location": "Rack ACC-02, Shelf 1",
        "description": "Supply and demand, market elasticity, consumer surplus, monopoly, oligopoly, game theory, and market failure externalities."
    },
    {
        "title": "Macroeconomics (10th Edition)",
        "isbn": "978-1319105990",
        "authors": ["N. Gregory Mankiw"],
        "category": "Accounting & Financial Economics",
        "publisher": "Worth Publishers",
        "year": 2019,
        "edition": "10th Edition",
        "call_number": "339 MAN 2019",
        "shelf_location": "Rack ACC-02, Shelf 2",
        "description": "National income accounting (GDP), aggregate demand and supply, IS-LM model, fiscal and monetary policies, inflation, and unemployment."
    },
    {
        "title": "Sri Lankan Economy: Balancing Growth and Equity",
        "isbn": "978-9555801454",
        "authors": ["S. Kelegama", "D. Weerakoon"],
        "category": "Accounting & Financial Economics",
        "publisher": "Institute of Policy Studies of Sri Lanka (IPS)",
        "year": 2018,
        "edition": "1st Edition",
        "call_number": "330.95493 KEL 2018",
        "shelf_location": "Rack ACC-02, Shelf 3",
        "description": "In-depth review of post-independence Sri Lankan macroeconomic policies, export performance, agricultural productivity, and debt dynamics."
    },

    # --- 7. TECHNOLOGY & BIOSYSTEMS (25 Books) ---
    {
        "title": "Introduction to Biosystems Engineering",
        "isbn": "978-0849318856",
        "authors": ["Evangelos C. Petrou", "Mark A. Eiteman"],
        "category": "Technology & Biosystems Engineering",
        "publisher": "CRC Press",
        "year": 2017,
        "edition": "1st Edition",
        "call_number": "660.6 PET 2017",
        "shelf_location": "Rack TECH-01, Shelf 1",
        "description": "Mass and energy balances in biological systems, bioprocess kinetics, heat transfer in post-harvest handling, and bio-environmental control."
    },
    {
        "title": "Postharvest Technology of Horticultural Crops",
        "isbn": "978-1879906518",
        "authors": ["Adel A. Kader"],
        "category": "Technology & Biosystems Engineering",
        "publisher": "University of California Agriculture & Natural Resources",
        "year": 2015,
        "edition": "3rd Edition",
        "call_number": "631.56 KAD 2015",
        "shelf_location": "Rack TECH-01, Shelf 2",
        "description": "Minimizing storage loss, cold chain management, controlled atmosphere packaging, and quality preservation of tropical fruits and vegetables."
    },
    {
        "title": "Renewable Energy: Physics, Engineering, Environmental Impacts",
        "isbn": "978-0199543410",
        "authors": ["Bent Sorensen"],
        "category": "Technology & Biosystems Engineering",
        "publisher": "Academic Press / Elsevier",
        "year": 2018,
        "edition": "5th Edition",
        "call_number": "621.042 SOR 2018",
        "shelf_location": "Rack TECH-01, Shelf 3",
        "description": "Solar photovoltaic systems, biomass energy conversion, wind turbines, micro-hydro stations, and battery storage integration."
    },

    # --- 8. VANNI & SRI LANKA SPECIAL HERITAGE COLLECTION (25 Books) ---
    {
        "title": "History of the Vanni: From Ancient Times to the Modern Era",
        "isbn": "978-9556593457",
        "authors": ["Prof. P. Pushparatnam", "Dr. S. Pathmanathan"],
        "category": "Vanni & Sri Lanka Heritage Collection",
        "publisher": "University of Jaffna & Vavuniya Publications",
        "year": 2018,
        "edition": "Special Monograph Edition",
        "call_number": "954.931 PUS 2018",
        "shelf_location": "Special Stacks, Room 204",
        "description": "Definitive archaeological and epigraphical study of ancient settlements, Vanni chieftaincies, Kurunthurmalai, and colonial administrative records in Vavuniya."
    },
    {
        "title": "The Ancient Irrigation and Cascade Tank Systems of Northern Sri Lanka",
        "isbn": "978-9558095123",
        "authors": ["C. R. Panabokke", "R. Sakthivadivel"],
        "category": "Vanni & Sri Lanka Heritage Collection",
        "publisher": "International Water Management Institute (IWMI)",
        "year": 2016,
        "edition": "1st Edition",
        "call_number": "631.7 PAN 2016",
        "shelf_location": "Special Stacks, Room 204",
        "description": "Hydrological documentation of the small tank cascade systems of the Malwathu Oya and Kanagarayan Aru basins in the Vavuniya dry zone."
    },
    {
        "title": "Ceylon and the Portuguese: 1505–1658",
        "isbn": "978-9559140023",
        "authors": ["P. E. Pieris"],
        "category": "Vanni & Sri Lanka Heritage Collection",
        "publisher": "Godage International Publishers",
        "year": 2015,
        "edition": "Historical Reissue",
        "call_number": "954.9301 PIE 2015",
        "shelf_location": "Special Stacks, Room 204",
        "description": "Classic historical narrative documenting Portuguese interactions, trade monopolies, treaties, and battles with native kingdoms across the island."
    },
    {
        "title": "Constitutional and Administrative Law of Sri Lanka",
        "isbn": "978-9551234567",
        "authors": ["Dr. J. A. L. Cooray"],
        "category": "Vanni & Sri Lanka Heritage Collection",
        "publisher": "Hansard Publishers",
        "year": 2017,
        "edition": "4th Edition",
        "call_number": "342.5493 COO 2017",
        "shelf_location": "Special Stacks, Room 204",
        "description": "Comprehensive treatise on the Sri Lankan 1978 Constitution, fundamental rights, separation of powers, judicial review, and provincial devolution."
    },
    {
        "title": "Folk Literature and Songs of the Vanni Region",
        "isbn": "978-9556598810",
        "authors": ["Dr. K. Sivasoruby", "S. Vimalan"],
        "category": "Vanni & Sri Lanka Heritage Collection",
        "publisher": "Department of Languages, University of Vavuniya",
        "year": 2022,
        "edition": "1st Edition",
        "call_number": "894.811 SIV 2022",
        "shelf_location": "Special Stacks, Room 204",
        "description": "Collection and critical analysis of oral folklore, agricultural songs, lullabies, and traditional spiritual narratives preserved in the Vanni rural villages."
    },
]

# Additional 160 procedural high-caliber books across categories to easily exceed 220 records!
ACADEMIC_EXPANSION_TEMPLATES = [
    # Computer Science & IT (40 more)
    ("Foundations of Machine Learning", "Mehryar Mohri, Afshin Rostamizadeh", "Computer Science & Information Technology", "MIT Press", "006.31 MOH", "Rack CS-17, Shelf 1"),
    ("Reinforcement Learning: An Introduction (2nd Edition)", "Richard S. Sutton, Andrew G. Barto", "Computer Science & Information Technology", "MIT Press", "006.31 SUT", "Rack CS-17, Shelf 2"),
    ("Automated Software Testing: Introduction, Management, and Performance", "Elfriede Dustin, Jeff Rashka", "Computer Science & Information Technology", "Addison-Wesley", "005.14 DUS", "Rack CS-17, Shelf 3"),
    ("Introduction to Embedded Systems: A Cyber-Physical Systems Approach", "Edward Ashford Lee, Sanjit Arunkumar Seshia", "Computer Science & Information Technology", "MIT Press", "004.2 LEE", "Rack CS-18, Shelf 1"),
    ("Computer Graphics: Principles and Practice (3rd Edition)", "John F. Hughes, Andries van Dam", "Computer Science & Information Technology", "Pearson", "006.6 HUG", "Rack CS-18, Shelf 2"),
    ("Software Architecture in Practice (4th Edition)", "Len Bass, Paul Clements, Rick Kazman", "Computer Science & Information Technology", "Addison-Wesley", "005.1 BAS", "Rack CS-18, Shelf 3"),
    ("Information Architecture: For the Web and Beyond", "Louis Rosenfeld, Peter Morville", "Computer Science & Information Technology", "O'Reilly Media", "025.04 ROS", "Rack CS-19, Shelf 1"),
    ("Programming Language Pragmatics (4th Edition)", "Michael L. Scott", "Computer Science & Information Technology", "Morgan Kaufmann", "005.13 SCO", "Rack CS-19, Shelf 2"),
    ("Algorithms on Strings, Trees, and Sequences", "Dan Gusfield", "Computer Science & Information Technology", "Cambridge University Press", "518.1 GUS", "Rack CS-19, Shelf 3"),
    ("Computational Geometry: Algorithms and Applications", "Mark de Berg, Otfried Cheong", "Computer Science & Information Technology", "Springer", "516.3 BER", "Rack CS-20, Shelf 1"),
    ("Database Systems: The Complete Book (2nd Edition)", "Hector Garcia-Molina, Jeffrey D. Ullman", "Computer Science & Information Technology", "Pearson", "005.74 GAR", "Rack CS-20, Shelf 2"),
    ("Mobile Communications (2nd Edition)", "Jochen Schiller", "Computer Science & Information Technology", "Addison-Wesley", "004.6 SCH", "Rack CS-20, Shelf 3"),
    ("Wireless Communications: Principles and Practice", "Theodore S. Rappaport", "Computer Science & Information Technology", "Prentice Hall", "621.382 RAP", "Rack CS-21, Shelf 1"),
    ("Distributed Operating Systems: Concepts and Design", "Pradeep K. Sinha", "Computer Science & Information Technology", "IEEE Press", "005.43 SIN", "Rack CS-21, Shelf 2"),
    ("Introduction to Parallel Computing (2nd Edition)", "Ananth Grama, Anshul Gupta", "Computer Science & Information Technology", "Pearson", "004.35 GRA", "Rack CS-21, Shelf 3"),
    ("Cloud Native Patterns: Designing High-Availability Applications", "Cornelia Davis", "Computer Science & Information Technology", "Manning Publications", "004.678 DAV", "Rack CS-22, Shelf 1"),
    ("Building Microservices: Designing Fine-Grained Systems (2nd Edition)", "Sam Newman", "Computer Science & Information Technology", "O'Reilly Media", "005.1 NEW", "Rack CS-22, Shelf 2"),
    ("Domain-Driven Design: Tackling Complexity in the Heart of Software", "Eric Evans", "Computer Science & Information Technology", "Addison-Wesley", "005.1 EVA", "Rack CS-22, Shelf 3"),
    ("Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment", "Jez Humble, David Farley", "Computer Science & Information Technology", "Addison-Wesley", "005.1 HUM", "Rack CS-23, Shelf 1"),
    ("Effective Java (3rd Edition)", "Joshua Bloch", "Computer Science & Information Technology", "Addison-Wesley", "005.133 BLO", "Rack CS-23, Shelf 2"),
    ("Learning TypeScript: Enhance Your Web Development Skills", "Josh Goldberg", "Computer Science & Information Technology", "O'Reilly Media", "005.133 GOL", "Rack CS-23, Shelf 3"),
    ("Python for Data Analysis (3rd Edition)", "Wes McKinney", "Computer Science & Information Technology", "O'Reilly Media", "005.133 MCK", "Rack CS-24, Shelf 1"),
    ("Deep Learning for Vision Systems", "Mohamed Elgendy", "Computer Science & Information Technology", "Manning Publications", "006.37 ELG", "Rack CS-24, Shelf 2"),
    ("Generative Deep Learning (2nd Edition)", "David Foster", "Computer Science & Information Technology", "O'Reilly Media", "006.31 FOS", "Rack CS-24, Shelf 3"),
    ("Foundations of Deep Reinforcement Learning", "Laura Graesser, Wah Loon Keng", "Computer Science & Information Technology", "Addison-Wesley", "006.31 GRA", "Rack CS-25, Shelf 1"),
    ("Web Development with Node and Express (2nd Edition)", "Ethan Brown", "Computer Science & Information Technology", "O'Reilly Media", "005.276 BRO", "Rack CS-25, Shelf 2"),
    ("Angular in Action", "Jeremy Wilken", "Computer Science & Information Technology", "Manning Publications", "005.276 WIL", "Rack CS-25, Shelf 3"),
    ("Vue.js in Action", "Erik Hanchett, Benjamin Listwon", "Computer Science & Information Technology", "Manning Publications", "005.276 HAN", "Rack CS-26, Shelf 1"),
    ("Clean Architecture: A Craftsman's Guide to Software Structure", "Robert C. Martin", "Computer Science & Information Technology", "Prentice Hall", "005.1 MAR", "Rack CS-26, Shelf 2"),
    ("Refactoring: Improving the Design of Existing Code (2nd Edition)", "Martin Fowler", "Computer Science & Information Technology", "Addison-Wesley", "005.16 FOW", "Rack CS-26, Shelf 3"),
    ("Code Complete: A Practical Handbook of Software Construction (2nd Edition)", "Steve McConnell", "Computer Science & Information Technology", "Microsoft Press", "005.1 MCC", "Rack CS-27, Shelf 1"),
    ("Practical Malware Analysis", "Michael Sikorski, Andrew Honig", "Computer Science & Information Technology", "No Starch Press", "005.8 SIK", "Rack CS-27, Shelf 2"),
    ("The Web Application Hacker's Handbook (2nd Edition)", "Dafydd Stuttard, Marcus Pinto", "Computer Science & Information Technology", "Wiley", "005.8 STU", "Rack CS-27, Shelf 3"),
    ("Hacking: The Art of Exploitation (2nd Edition)", "Jon Erickson", "Computer Science & Information Technology", "No Starch Press", "005.8 ERI", "Rack CS-28, Shelf 1"),
    ("Network Security: Private Communication in a Public World", "Charlie Kaufman, Radia Perlman, Mike Speciner", "Computer Science & Information Technology", "Prentice Hall", "005.8 KAU", "Rack CS-28, Shelf 2"),
    ("Applied Cryptography (20th Anniversary Edition)", "Bruce Schneier", "Computer Science & Information Technology", "Wiley", "005.82 SCH", "Rack CS-28, Shelf 3"),
    ("Database Reliability Engineering", "Laine Campbell, Charity Majors", "Computer Science & Information Technology", "O'Reilly Media", "005.74 CAM", "Rack CS-29, Shelf 1"),
    ("Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing", "Tyler Akidau, Slava Chernyak", "Computer Science & Information Technology", "O'Reilly Media", "005.74 AKI", "Rack CS-29, Shelf 2"),
    ("Kafka: The Definitive Guide (2nd Edition)", "Gwen Shapira, Todd Palino, Rajini Sivaram", "Computer Science & Information Technology", "O'Reilly Media", "005.75 SHA", "Rack CS-29, Shelf 3"),
    ("Cassandra: The Definitive Guide (3rd Edition)", "Jeff Carpenter, Eben Hewitt", "Computer Science & Information Technology", "O'Reilly Media", "005.75 CAR", "Rack CS-30, Shelf 1"),

    # Mathematics & Statistics (25 more)
    ("Real and Complex Analysis (3rd Edition)", "Walter Rudin", "Mathematics & Statistics", "McGraw-Hill", "515 RUD", "Rack MS-06, Shelf 1"),
    ("Functional Analysis (2nd Edition)", "Walter Rudin", "Mathematics & Statistics", "McGraw-Hill", "515.7 RUD", "Rack MS-06, Shelf 2"),
    ("Topology (2nd Edition)", "James Munkres", "Mathematics & Statistics", "Pearson", "514 MUN", "Rack MS-06, Shelf 3"),
    ("Algebra (3rd Edition)", "Serge Lang", "Mathematics & Statistics", "Springer", "512 LAN", "Rack MS-07, Shelf 1"),
    ("Differential Geometry of Curves and Surfaces", "Manfredo P. do Carmo", "Mathematics & Statistics", "Prentice Hall", "516.36 CAR", "Rack MS-07, Shelf 2"),
    ("Introduction to Smooth Manifolds (2nd Edition)", "John M. Lee", "Mathematics & Statistics", "Springer", "516.36 LEE", "Rack MS-07, Shelf 3"),
    ("Partial Differential Equations (2nd Edition)", "Lawrence C. Evans", "Mathematics & Statistics", "American Mathematical Society", "515.353 EVA", "Rack MS-08, Shelf 1"),
    ("Introduction to Real Analysis (4th Edition)", "Robert G. Bartle, Donald R. Sherbert", "Mathematics & Statistics", "Wiley", "515.8 BAR", "Rack MS-08, Shelf 2"),
    ("An Introduction to Measure Theory", "Terence Tao", "Mathematics & Statistics", "American Mathematical Society", "515.42 TAO", "Rack MS-08, Shelf 3"),
    ("Probability: Theory and Examples (5th Edition)", "Rick Durrett", "Mathematics & Statistics", "Cambridge University Press", "519.2 DUR", "Rack MS-09, Shelf 1"),
    ("Statistical Inference (2nd Edition)", "George Casella, Roger L. Berger", "Mathematics & Statistics", "Duxbury Press", "519.5 CAS", "Rack MS-09, Shelf 2"),
    ("Linear Models in Statistics (2nd Edition)", "Alvin C. Rencher, G. Bruce Schaalje", "Mathematics & Statistics", "Wiley", "519.535 REN", "Rack MS-09, Shelf 3"),
    ("Generalized Linear Models (2nd Edition)", "P. McCullagh, J. A. Nelder", "Mathematics & Statistics", "Chapman and Hall/CRC", "519.53 MCC", "Rack MS-10, Shelf 1"),
    ("Bayesian Data Analysis (3rd Edition)", "Andrew Gelman, John B. Carlin, Hal S. Stern", "Mathematics & Statistics", "Chapman and Hall/CRC", "519.542 GEL", "Rack MS-10, Shelf 2"),
    ("All of Statistics: A Concise Course in Statistical Inference", "Larry Wasserman", "Mathematics & Statistics", "Springer", "519.5 WAS", "Rack MS-10, Shelf 3"),
    ("Convex Optimization", "Stephen Boyd, Lieven Vandenberghe", "Mathematics & Statistics", "Cambridge University Press", "519.6 BOY", "Rack MS-11, Shelf 1"),
    ("Nonlinear Programming (3rd Edition)", "Dimitri P. Bertsekas", "Mathematics & Statistics", "Athena Scientific", "519.7 BER", "Rack MS-11, Shelf 2"),
    ("Numerical Linear Algebra", "Lloyd N. Trefethen, David Bau III", "Mathematics & Statistics", "SIAM", "518.43 TRE", "Rack MS-11, Shelf 3"),
    ("Matrix Analysis (2nd Edition)", "Roger A. Horn, Charles R. Johnson", "Mathematics & Statistics", "Cambridge University Press", "512.943 HOR", "Rack MS-12, Shelf 1"),
    ("Introduction to Stochastic Processes", "Gregory F. Lawler", "Mathematics & Statistics", "Chapman and Hall/CRC", "519.23 LAW", "Rack MS-12, Shelf 2"),
    ("Brownian Motion and Stochastic Calculus", "Ioannis Karatzas, Steven E. Shreve", "Mathematics & Statistics", "Springer", "519.28 KAR", "Rack MS-12, Shelf 3"),
    ("Elementary Number Theory (7th Edition)", "David M. Burton", "Mathematics & Statistics", "McGraw-Hill", "512.7 BUR", "Rack MS-13, Shelf 1"),
    ("Introductory Combinatorics (5th Edition)", "Richard A. Brualdi", "Mathematics & Statistics", "Pearson", "511.6 BRU", "Rack MS-13, Shelf 2"),
    ("A Course in Game Theory", "Martin J. Osborne, Ariel Rubinstein", "Mathematics & Statistics", "MIT Press", "519.3 OSB", "Rack MS-13, Shelf 3"),
    ("Mathematical Modeling (4th Edition)", "Mark M. Meerschaert", "Mathematics & Statistics", "Academic Press", "511.8 MEE", "Rack MS-14, Shelf 1"),

    # Biological Sciences & Biotechnology (25 more)
    ("Principles of Gene Manipulation and Genomics (7th Edition)", "Sandy B. Primrose, Richard Twyman", "Biological Sciences & Biotechnology", "Blackwell Publishing", "572.8 PRI", "Rack BS-05, Shelf 1"),
    ("Gene Cloning and DNA Analysis: An Introduction (7th Edition)", "T. A. Brown", "Biological Sciences & Biotechnology", "Wiley-Blackwell", "572.8 BRO", "Rack BS-05, Shelf 2"),
    ("Molecular Cloning: A Laboratory Manual (4th Edition)", "Michael R. Green, Joseph Sambrook", "Biological Sciences & Biotechnology", "Cold Spring Harbor Laboratory Press", "572.8 GRE", "Rack BS-05, Shelf 3"),
    ("Kuby Immunology (8th Edition)", "Jenni Punt, Sharon Stranford, Patricia Jones", "Biological Sciences & Biotechnology", "W. H. Freeman", "616.079 PUN", "Rack BS-06, Shelf 1"),
    ("Cellular and Molecular Immunology (10th Edition)", "Abul K. Abbas, Andrew H. Lichtman, Shiv Pillai", "Biological Sciences & Biotechnology", "Elsevier", "616.079 ABB", "Rack BS-06, Shelf 2"),
    ("Bioprocess Engineering Principles (2nd Edition)", "Pauline M. Doran", "Biological Sciences & Biotechnology", "Academic Press", "660.63 DOR", "Rack BS-06, Shelf 3"),
    ("Plant Pathology (5th Edition)", "George N. Agrios", "Biological Sciences & Biotechnology", "Academic Press", "632.3 AGR", "Rack BS-07, Shelf 1"),
    ("Plant Systematics (3rd Edition)", "Michael G. Simpson", "Biological Sciences & Biotechnology", "Academic Press", "580.12 SIM", "Rack BS-07, Shelf 2"),
    ("Raven Biology of Plants (8th Edition)", "Ray F. Evert, Susan E. Eichhorn", "Biological Sciences & Biotechnology", "W. H. Freeman", "580 EVE", "Rack BS-07, Shelf 3"),
    ("Brock Biology of Microorganisms (15th Edition)", "Michael T. Madigan, Kelly S. Bender", "Biological Sciences & Biotechnology", "Pearson", "579 MAD", "Rack BS-08, Shelf 1"),
    ("Principles of Virology (5th Edition)", "Jane Flint, Vincent R. Racaniello", "Biological Sciences & Biotechnology", "ASM Press", "579.2 FLI", "Rack BS-08, Shelf 2"),
    ("Medical Microbiology (9th Edition)", "Patrick R. Murray, Ken S. Rosenthal", "Biological Sciences & Biotechnology", "Elsevier", "616.9041 MUR", "Rack BS-08, Shelf 3"),
    ("Developmental Biology (12th Edition)", "Michael J. F. Barresi, Scott F. Gilbert", "Biological Sciences & Biotechnology", "Oxford University Press", "571.8 BAR", "Rack BS-09, Shelf 1"),
    ("Animal Physiology (4th Edition)", "Richard W. Hill, Gordon A. Wyse, Margaret Anderson", "Biological Sciences & Biotechnology", "Oxford University Press", "571.1 HIL", "Rack BS-09, Shelf 2"),
    ("Evolution (4th Edition)", "Douglas J. Futuyma, Mark Kirkpatrick", "Biological Sciences & Biotechnology", "Sinauer Associates / Oxford", "576.8 FUT", "Rack BS-09, Shelf 3"),
    ("Bioinformatics: Sequence and Genome Analysis (2nd Edition)", "David W. Mount", "Biological Sciences & Biotechnology", "Cold Spring Harbor Press", "572.8 MOU", "Rack BS-10, Shelf 1"),
    ("Bioinformatics and Functional Genomics (3rd Edition)", "Jonathan Pevsner", "Biological Sciences & Biotechnology", "Wiley-Blackwell", "572.8 PEV", "Rack BS-10, Shelf 2"),
    ("Conservation Biology for All", "Navjot S. Sodhi, Paul R. Ehrlich", "Biological Sciences & Biotechnology", "Oxford University Press", "333.95 SOD", "Rack BS-10, Shelf 3"),
    ("Limnology: Lake and River Ecosystems (3rd Edition)", "Robert G. Wetzel", "Biological Sciences & Biotechnology", "Academic Press", "577.6 WET", "Rack BS-11, Shelf 1"),
    ("Soil Microbiology, Ecology and Biochemistry (4th Edition)", "Eldor A. Paul", "Biological Sciences & Biotechnology", "Academic Press", "579.1757 PAU", "Rack BS-11, Shelf 2"),
    ("Principles of Environmental Toxicology", "I. C. Shaw, J. Chadwick", "Biological Sciences & Biotechnology", "CRC Press", "615.9 SHA", "Rack BS-11, Shelf 3"),
    ("Environmental Biotechnology: Principles and Applications (2nd Edition)", "Bruce E. Rittmann, Perry L. McCarty", "Biological Sciences & Biotechnology", "McGraw-Hill", "628.5 RIT", "Rack BS-12, Shelf 1"),
    ("Marine Biology (11th Edition)", "Peter Castro, Michael E. Huber", "Biological Sciences & Biotechnology", "McGraw-Hill", "578.77 CAS", "Rack BS-12, Shelf 2"),
    ("Ethnobotany: Evolution of a Discipline", "Richard Evans Schultes, Siri von Reis", "Biological Sciences & Biotechnology", "Dioscorides Press", "581.63 SCH", "Rack BS-12, Shelf 3"),
    ("Flora of Ceylon: A Revised Handbook (Volume 1-14)", "M. D. Dassanayake, F. R. Fosberg", "Biological Sciences & Biotechnology", "Amerind Publishing & Smithsonian", "581.95493 DAS", "Rack BS-13, Shelf 1"),

    # Physical Sciences & Chemistry (20 more)
    ("Classical Mechanics (3rd Edition)", "Herbert Goldstein, Charles P. Poole, John L. Safko", "Physical Sciences & Chemistry", "Pearson", "531 GOL", "Rack PS-04, Shelf 1"),
    ("Analytical Mechanics (7th Edition)", "Grant R. Fowles, George L. Cassiday", "Physical Sciences & Chemistry", "Cengage Learning", "531 FOW", "Rack PS-04, Shelf 2"),
    ("Thermodynamics, Kinetic Theory, and Statistical Thermodynamics", "Francis W. Sears, Gerhard L. Salinger", "Physical Sciences & Chemistry", "Addison-Wesley", "536.7 SEA", "Rack PS-04, Shelf 3"),
    ("Statistical Mechanics (3rd Edition)", "R. K. Pathria, Paul D. Beale", "Physical Sciences & Chemistry", "Academic Press", "530.13 PAT", "Rack PS-05, Shelf 1"),
    ("Optics (5th Edition)", "Eugene Hecht", "Physical Sciences & Chemistry", "Pearson", "535 HEC", "Rack PS-05, Shelf 2"),
    ("Solid State Physics", "Neil W. Ashcroft, N. David Mermin", "Physical Sciences & Chemistry", "Cengage Learning", "530.41 ASH", "Rack PS-05, Shelf 3"),
    ("Introduction to Solid State Physics (8th Edition)", "Charles Kittel", "Physical Sciences & Chemistry", "Wiley", "530.41 KIT", "Rack PS-06, Shelf 1"),
    ("Concepts of Modern Physics (6th Edition)", "Arthur Beiser", "Physical Sciences & Chemistry", "McGraw-Hill", "539 BEI", "Rack PS-06, Shelf 2"),
    ("Introductory Nuclear Physics", "Kenneth S. Krane", "Physical Sciences & Chemistry", "Wiley", "539.7 KRA", "Rack PS-06, Shelf 3"),
    ("Mathematical Methods for Physicists (7th Edition)", "George B. Arfken, Hans J. Weber", "Physical Sciences & Chemistry", "Academic Press", "530.15 ARF", "Rack PS-07, Shelf 1"),
    ("Vogel's Textbook of Quantitative Chemical Analysis (6th Edition)", "J. Mendham, R. C. Denney, J. D. Barnes", "Physical Sciences & Chemistry", "Prentice Hall", "543 MEN", "Rack PS-07, Shelf 2"),
    ("Vogel's Textbook of Practical Organic Chemistry (5th Edition)", "B. S. Furniss, A. J. Hannaford", "Physical Sciences & Chemistry", "Longman", "547.0078 FUR", "Rack PS-07, Shelf 3"),
    ("Fundamentals of Analytical Chemistry (9th Edition)", "Douglas A. Skoog, Donald M. West, F. James Holler", "Physical Sciences & Chemistry", "Cengage Learning", "543 SKO", "Rack PS-08, Shelf 1"),
    ("Principles of Instrumental Analysis (7th Edition)", "Douglas A. Skoog, F. James Holler, Stanley R. Crouch", "Physical Sciences & Chemistry", "Cengage Learning", "543 SKO", "Rack PS-08, Shelf 2"),
    ("Physical Chemistry (4th Edition)", "Robert J. Silbey, Robert A. Alberty, Moungi G. Bawendi", "Physical Sciences & Chemistry", "Wiley", "541 SIL", "Rack PS-08, Shelf 3"),
    ("Quantum Chemistry (7th Edition)", "Ira N. Levine", "Physical Sciences & Chemistry", "Pearson", "541.28 LEV", "Rack PS-09, Shelf 1"),
    ("Advanced Organic Chemistry: Part A: Structure and Mechanisms (5th Edition)", "Francis A. Carey, Richard J. Sundberg", "Physical Sciences & Chemistry", "Springer", "547 CAR", "Rack PS-09, Shelf 2"),
    ("Advanced Organic Chemistry: Part B: Reactions and Synthesis (5th Edition)", "Francis A. Carey, Richard J. Sundberg", "Physical Sciences & Chemistry", "Springer", "547.2 CAR", "Rack PS-09, Shelf 3"),
    ("Spectroscopic Methods in Organic Chemistry (7th Edition)", "Ian Fleming, Dudley Williams", "Physical Sciences & Chemistry", "Springer", "547.3085 FLE", "Rack PS-10, Shelf 1"),
    ("Coordination Chemistry", "Fred Basolo, Ronald C. Johnson", "Physical Sciences & Chemistry", "Science Reviews", "546.6 BAS", "Rack PS-10, Shelf 2"),

    # Business, Accounting & Finance (30 more)
    ("Investments (12th Edition)", "Zvi Bodie, Alex Kane, Alan J. Marcus", "Accounting & Financial Economics", "McGraw-Hill", "332.6 BOD", "Rack ACC-03, Shelf 1"),
    ("Financial Markets and Institutions (9th Edition)", "Frederic S. Mishkin, Stanley G. Eakins", "Accounting & Financial Economics", "Pearson", "332.1 MIS", "Rack ACC-03, Shelf 2"),
    ("Options, Futures, and Other Derivatives (11th Edition)", "John C. Hull", "Accounting & Financial Economics", "Pearson", "332.645 HUL", "Rack ACC-03, Shelf 3"),
    ("International Economics: Theory and Policy (11th Edition)", "Paul R. Krugman, Maurice Obstfeld, Marc Melitz", "Accounting & Financial Economics", "Pearson", "337 KRU", "Rack ACC-04, Shelf 1"),
    ("Development Economics", "Debraj Ray", "Accounting & Financial Economics", "Princeton University Press", "338.9 RAY", "Rack ACC-04, Shelf 2"),
    ("Econometric Analysis (8th Edition)", "William H. Greene", "Accounting & Financial Economics", "Pearson", "330.015 GRE", "Rack ACC-04, Shelf 3"),
    ("Basic Econometrics (5th Edition)", "Damodar N. Gujarati, Dawn C. Porter", "Accounting & Financial Economics", "McGraw-Hill", "330.015 GUJ", "Rack ACC-05, Shelf 1"),
    ("Introductory Econometrics: A Modern Approach (7th Edition)", "Jeffrey M. Wooldridge", "Accounting & Financial Economics", "Cengage Learning", "330.015 WOO", "Rack ACC-05, Shelf 2"),
    ("Financial Statement Analysis and Security Valuation (5th Edition)", "Stephen H. Penman", "Accounting & Financial Economics", "McGraw-Hill", "657.3 PEN", "Rack ACC-05, Shelf 3"),
    ("Auditing and Assurance Services: An Integrated Approach (16th Edition)", "Alvin A. Arens, Randal J. Elder, Mark S. Beasley", "Accounting & Financial Economics", "Pearson", "657.45 ARE", "Rack ACC-06, Shelf 1"),
    ("Management Accounting (7th Edition)", "Anthony A. Atkinson, Robert S. Kaplan, Ella Mae Matsumura", "Accounting & Financial Economics", "Pearson", "658.1511 ATK", "Rack ACC-06, Shelf 2"),
    ("International Financial Reporting Standards (IFRS) Workbook", "Abbas A. Mirza, Nandakumar Ankarath", "Accounting & Financial Economics", "Wiley", "657.0218 MIR", "Rack ACC-06, Shelf 3"),
    ("Public Finance in Theory and Practice (5th Edition)", "Richard A. Musgrave, Peggy B. Musgrave", "Accounting & Financial Economics", "McGraw-Hill", "336 MUS", "Rack ACC-07, Shelf 1"),
    ("Monetary Economics: Policy and its Theoretical Basis", "Mervyn K. Lewis, Paul D. Mizen", "Accounting & Financial Economics", "Oxford University Press", "332.4 LEW", "Rack ACC-07, Shelf 2"),
    ("The Economics of Money, Banking, and Financial Markets (12th Edition)", "Frederic S. Mishkin", "Accounting & Financial Economics", "Pearson", "332 MIS", "Rack ACC-07, Shelf 3"),
    ("Services Marketing: People, Technology, Strategy (9th Edition)", "Jochen Wirtz, Christopher Lovelock", "Business Studies & Management", "World Scientific", "658.8 LUV", "Rack MGT-04, Shelf 1"),
    ("International Business: Competing in the Global Marketplace (13th Edition)", "Charles W. L. Hill, G. Tomas M. Hult", "Business Studies & Management", "McGraw-Hill", "658.049 HIL", "Rack MGT-04, Shelf 2"),
    ("Business Research Methods (13th Edition)", "Pamela S. Schindler", "Business Studies & Management", "McGraw-Hill", "658.0072 SCH", "Rack MGT-04, Shelf 3"),
    ("Research Design: Qualitative, Quantitative, and Mixed Methods Approaches", "John W. Creswell, J. David Creswell", "Business Studies & Management", "SAGE Publications", "300.72 CRE", "Rack MGT-05, Shelf 1"),
    ("Supply Chain Logistics Management (5th Edition)", "Donald J. Bowersox, David J. Closs, M. Bixby Cooper", "Business Studies & Management", "McGraw-Hill", "658.7 BOW", "Rack MGT-05, Shelf 2"),
    ("Purchasing and Supply Chain Management (6th Edition)", "Robert M. Monczka, Robert B. Handfield", "Business Studies & Management", "Cengage Learning", "658.72 MON", "Rack MGT-05, Shelf 3"),
    ("Management Information Systems: Managing the Digital Firm (16th Edition)", "Kenneth C. Laudon, Jane P. Laudon", "Business Studies & Management", "Pearson", "658.4038 LAU", "Rack MGT-06, Shelf 1"),
    ("Corporate Governance: Principles, Policies, and Practices (3rd Edition)", "Bob Tricker", "Business Studies & Management", "Oxford University Press", "658.42 TRI", "Rack MGT-06, Shelf 2"),
    ("Business Ethics: Concepts and Cases (8th Edition)", "Manuel G. Velasquez", "Business Studies & Management", "Pearson", "174.4 VEL", "Rack MGT-06, Shelf 3"),
    ("Retail Management: A Strategic Approach (13th Edition)", "Barry Berman, Joel R. Evans, Patrali Chatterjee", "Business Studies & Management", "Pearson", "658.87 BER", "Rack MGT-07, Shelf 1"),
    ("Advertising and Promotion: An Integrated Marketing Communications Perspective", "George E. Belch, Michael A. Belch", "Business Studies & Management", "McGraw-Hill", "659.1 BEL", "Rack MGT-07, Shelf 2"),
    ("Total Quality Management (3rd Edition)", "Dale H. Besterfield, Carol Besterfield-Michna", "Business Studies & Management", "Pearson", "658.562 BES", "Rack MGT-07, Shelf 3"),
    ("Lean Six Sigma: Combining Six Sigma Quality with Lean Production Speed", "Michael L. George", "Business Studies & Management", "McGraw-Hill", "658.401 GEO", "Rack MGT-08, Shelf 1"),
    ("Negotiation (8th Edition)", "Roy J. Lewicki, Bruce Barry, David M. Saunders", "Business Studies & Management", "McGraw-Hill", "658.4052 LEW", "Rack MGT-08, Shelf 2"),
    ("Case Studies in Finance: Managing for Corporate Value Creation (8th Edition)", "Robert F. Bruner, Kenneth M. Eades, Michael J. Schill", "Accounting & Financial Economics", "McGraw-Hill", "658.15 BRU", "Rack MGT-08, Shelf 3"),

    # Technology & Biosystems (10 more)
    ("Principles of Food Processing", "Richard W. Hartel, Dennis R. Heldman", "Technology & Biosystems Engineering", "Springer", "664 HAR", "Rack TECH-02, Shelf 1"),
    ("Food Engineering Operations (3rd Edition)", "J. G. Brennan, J. R. Cowell", "Technology & Biosystems Engineering", "Elsevier", "664 BRE", "Rack TECH-02, Shelf 2"),
    ("Agricultural Waste Management: Field Handbook", "Natural Resources Conservation Service", "Technology & Biosystems Engineering", "USDA Publications", "628.74 NRC", "Rack TECH-02, Shelf 3"),
    ("Precision Agriculture: Technology and Applications", "Qin Zhang", "Technology & Biosystems Engineering", "CRC Press", "631.3 ZHA", "Rack TECH-03, Shelf 1"),
    ("Solar Energy Engineering: Processes and Systems (2nd Edition)", "Soteris A. Kalogirou", "Technology & Biosystems Engineering", "Academic Press", "621.47 KAL", "Rack TECH-03, Shelf 2"),
    ("Wind Energy Explained: Theory, Design and Application (2nd Edition)", "James F. Manwell, Jon G. McGowan, Anthony L. Rogers", "Technology & Biosystems Engineering", "Wiley", "621.45 MAN", "Rack TECH-03, Shelf 3"),
    ("Biomass for Renewable Energy, Fuels, and Chemicals", "Donald L. Klass", "Technology & Biosystems Engineering", "Academic Press", "662.88 KLA", "Rack TECH-04, Shelf 1"),
    ("Sensors and Signal Conditioning (2nd Edition)", "Ramon Pallas-Areny, John G. Webster", "Technology & Biosystems Engineering", "Wiley", "681.2 PAL", "Rack TECH-04, Shelf 2"),
    ("Robotics, Vision and Control: Fundamental Algorithms in MATLAB", "Peter Corke", "Technology & Biosystems Engineering", "Springer", "629.892 COR", "Rack TECH-04, Shelf 3"),
    ("Introduction to Mechatronics and Measurement Systems (5th Edition)", "David G. Alciatore", "Technology & Biosystems Engineering", "McGraw-Hill", "621 ALC", "Rack TECH-05, Shelf 1"),

    # Vanni & Sri Lanka Heritage Special Collection (10 more)
    ("The Dutch in Ceylon: An Account of Their Early Visits and Relations", "R. G. Anthonisz", "Vanni & Sri Lanka Heritage Collection", "Colombo Apothecaries / Reissue", "954.9302 ANT", "Special Stacks, Room 204"),
    ("The Mahavamsa: The Great Chronicle of Ceylon", "Wilhelm Geiger", "Vanni & Sri Lanka Heritage Collection", "Pali Text Society / Godage", "954.9300 GEI", "Special Stacks, Room 204"),
    ("Archaeological Survey of Ceylon: Northern Province Inscriptions", "Prof. Senarath Paranavitana", "Vanni & Sri Lanka Heritage Collection", "Department of Archaeology Ceylon", "930.1549 PAR", "Special Stacks, Room 204"),
    ("Vavuniya District Socio-Economic Baseline Survey", "Planning Secretariat, District Secretariat Vavuniya", "Vanni & Sri Lanka Heritage Collection", "Government of Sri Lanka", "330.95493 DIS", "Special Stacks, Room 204"),
    ("The Culavamsa: Being the More Recent Part of the Mahavamsa", "Wilhelm Geiger", "Vanni & Sri Lanka Heritage Collection", "Pali Text Society", "954.9301 GEI", "Special Stacks, Room 204"),
    ("Ancient Ceylon: An Account of the Aborigines and of Part of the Early Civilisation", "H. Parker", "Vanni & Sri Lanka Heritage Collection", "Luzac & Co. / Reissue", "954.9301 PAR", "Special Stacks, Room 204"),
    ("Jaffna Kingdom: A Historical and Numismatic Study", "S. Pathmanathan", "Vanni & Sri Lanka Heritage Collection", "Rajendran Publishers", "954.931 PAT", "Special Stacks, Room 204"),
    ("Epigraphia Zeylanica: Being Lithic and Other Inscriptions of Ceylon", "Don Martino de Zilva Wickremasinghe", "Vanni & Sri Lanka Heritage Collection", "Oxford University Press / Ceylon Govt", "954.93 WIC", "Special Stacks, Room 204"),
    ("Flora of the Dry Zone of Sri Lanka with Special Reference to Vanni", "Dr. A. Srisatkunarajah, Dr. E. Karunairajan", "Vanni & Sri Lanka Heritage Collection", "University of Vavuniya Research Press", "581.95493 SRI", "Special Stacks, Room 204"),
    ("Traditional Agrarian Practices and Water Harvesting in Vanni", "K. Arulanantham, P. Thirunavukkarasu", "Vanni & Sri Lanka Heritage Collection", "Faculty of Applied Science Monographs", "631.709 ARU", "Special Stacks, Room 204"),
]

# Combine both lists
full_book_list = []
for b in BOOKS_DATA:
    full_book_list.append((
        b["title"],
        b["isbn"],
        b["authors"],
        categories[b["category"]],
        b["publisher"],
        b["year"],
        b.get("edition", "1st Edition"),
        b["call_number"],
        b["shelf_location"],
        b["description"]
    ))

isbn_counter = 8000
for template in ACADEMIC_EXPANSION_TEMPLATES:
    title, authors_str, cat_name, publisher, call_no, shelf = template
    isbn_counter += 1
    isbn = f"978-955-{isbn_counter:04d}-{isbn_counter % 9}"
    authors = [a.strip() for a in authors_str.split(',') if a.strip()]
    year = random.choice([2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024])
    edition = random.choice(["1st Edition", "2nd Edition", "3rd Edition", "4th Edition", "Global Edition"])
    desc = f"Comprehensive university textbook and academic reference work on {title.lower()} tailored for undergraduate degree curricula and research reference at the University of Vavuniya."
    full_book_list.append((
        title,
        isbn,
        authors,
        categories[cat_name],
        publisher,
        year,
        edition,
        call_no,
        shelf,
        desc
    ))

print(f"[*] Prepared {len(full_book_list)} book records to seed.")

# Seed into database atomically
created_books = 0
created_copies = 0
accession_counter = 1000

with transaction.atomic():
    for item in full_book_list:
        title, isbn, authors_list, cat_obj, publisher, year, edition, call_no, shelf, desc = item
        
        book, created = Book.objects.get_or_create(
            isbn=isbn,
            defaults={
                'title': title,
                'category': cat_obj,
                'publisher': publisher,
                'publication_year': year,
                'edition': edition,
                'call_number': call_no,
                'shelf_location': shelf,
                'description': desc
            }
        )

        if created:
            created_books += 1

            # Attach authors
            for a_name in authors_list:
                author_obj, _ = Author.objects.get_or_create(name=a_name)
                book.authors.add(author_obj)

            # Generate 2 to 4 physical copies per book
            num_copies = random.randint(2, 4)
            for i in range(num_copies):
                accession_counter += 1
                barcode = f"UOV-BC-{accession_counter:05d}"
                
                # First copy is Reference for special heritage or 20% of textbooks
                if i == 0 and ("Heritage" in cat_obj.name or random.random() < 0.25):
                    item_type = BookCopy.ItemType.REFERENCE
                    notes = "Reference Reading Room - Library Use Only"
                elif random.random() < 0.15:
                    item_type = BookCopy.ItemType.RESERVE
                    notes = "Course Reserve - 1 Day Loan"
                else:
                    item_type = BookCopy.ItemType.STANDARD
                    notes = "Standard Lending Collection"

                # Status distribution: 85% AVAILABLE, 10% BORROWED, 5% ON_HOLD
                r_status = random.random()
                if r_status < 0.85:
                    status = BookCopy.Status.AVAILABLE
                elif r_status < 0.95:
                    status = BookCopy.Status.BORROWED
                else:
                    status = BookCopy.Status.ON_HOLD

                cond = random.choice([BookCopy.Condition.NEW, BookCopy.Condition.GOOD, BookCopy.Condition.GOOD, BookCopy.Condition.FAIR])

                BookCopy.objects.create(
                    book=book,
                    accession_number=barcode,
                    item_type=item_type,
                    status=status,
                    condition=cond,
                    notes=notes
                )
                created_copies += 1

print(f"[+] Seeding completed successfully!")
print(f"[+] Newly Created Books: {created_books}")
print(f"[+] Newly Created Physical Copies with Unique Barcodes: {created_copies}")
print(f"[+] Total Books Now in Database: {Book.objects.count()}")
print(f"[+] Total Physical Copies with Barcodes Now in Database: {BookCopy.objects.count()}")
