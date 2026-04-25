# Synthetic Data Generator (Mockaroo-like Tool)

## 📌 Overview

This project is a full-stack web application designed to generate realistic, customizable synthetic datasets for development, testing, and data science workflows.

It allows users to define a schema (structure of data), configure statistical properties (like distributions, noise, and missing values), and export datasets in multiple formats such as CSV, JSON, and Excel.

The goal is to simulate real-world data conditions—including imperfections like noise and missing values—so that developers and data practitioners can build and test robust systems without relying on sensitive or unavailable real data.

---

## 🎯 Problem Statement

In real-world scenarios, access to high-quality datasets is often limited due to:

* Privacy and security concerns
* Lack of labeled or structured data
* Difficulty in simulating edge cases (outliers, missing values)
* Time-consuming manual data creation

Existing tools like Mockaroo solve this problem but are either feature-heavy, limited in free tiers, or not customizable at a deeper level.

This project aims to build a simplified yet powerful alternative that focuses on **core data generation + statistical realism**.

---

## 🚀 Key Objectives

* Provide an intuitive interface to define dataset schemas
* Support multiple data types (names, emails, numbers, dates, etc.)
* Enable statistical control using distributions (normal, uniform, exponential)
* Simulate real-world data imperfections:

  * Noise injection
  * Missing values
  * Outliers
* Generate relational datasets with basic foreign key constraints
* Export data in commonly used formats

---

## 🧠 Core Concept

At its core, the system works as a **data generation pipeline**:

1. Schema Definition
2. Base Data Generation (using libraries like Faker)
3. Statistical Transformation (distributions)
4. Data Corruption Simulation (noise, missing values, outliers)
5. Validation and Formatting
6. Export

This pipeline-based design ensures modularity, scalability, and clarity.

---

## 🏗️ Tech Stack

### Frontend

* Next.js / React
* UI for schema building, preview, and export

### Backend

* Python (FastAPI or Flask)
* Handles schema parsing and data generation logic

### Libraries

* Faker → realistic fake data
* NumPy → statistical distributions & noise
* Pandas → data manipulation and export
* random → lightweight randomness

---

## 🔑 Core Features

### 1. Schema Builder

* Define columns with name and data type
* Dropdown-based selection for common types

### 2. Data Generation

* Generate structured datasets (1K–10K rows)
* Supports multiple field types

### 3. Statistical Control

* Apply distributions:

  * Normal
  * Uniform
  * Exponential

### 4. Noise & Outlier Injection

* Add controlled randomness to numeric fields
* Inject extreme values to simulate anomalies

### 5. Missing Data Simulation

* Configure percentage of missing values per column
* Supports random or patterned missingness

### 6. Relational Data (Optional)

* Generate linked datasets (e.g., Users → Orders)
* Basic foreign key relationships

### 7. Export Options

* CSV
* JSON
* Excel
* SQL Inserts

---

## 💡 Why This Project Matters

This project sits at the intersection of:

* **Data Engineering** → dataset creation pipelines
* **Machine Learning** → training/testing data simulation
* **Software Testing** → realistic test data generation

It demonstrates:

* Full-stack development skills
* Understanding of statistics and probability
* System design (modular pipelines, schema abstraction)

---

## 📈 Future Enhancements

* Formula-based field generation
* Data preview with visualizations (histograms)
* Save/load schema configurations
* API access for programmatic data generation
* Seed-based reproducibility

---

## 🧭 Conclusion

This project is not just a data generator—it is a **controlled synthetic data simulation system** that helps replicate real-world data scenarios in a flexible and educational way.

---
