from typing import List, Dict, Any
from pydantic import BaseModel

class TemplateDefinition(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    schema_data: Dict[str, Any]

TEMPLATES = [
    {
        "id": "ecommerce",
        "name": "E-commerce System",
        "description": "Users, Products, Orders, and Reviews with full relational integrity.",
        "icon": "shopping-cart",
        "schema_data": {
            "tables": [
                {
                    "id": "users", "name": "Users",
                    "fields": [
                        {"id": "u1", "name": "id", "type": "integer", "required": True},
                        {"id": "u2", "name": "name", "type": "name", "required": True},
                        {"id": "u3", "name": "email", "type": "email", "required": True}
                    ]
                },
                {
                    "id": "products", "name": "Products",
                    "fields": [
                        {"id": "p1", "name": "id", "type": "integer", "required": True},
                        {"id": "p2", "name": "product_name", "type": "string", "required": True},
                        {"id": "p3", "name": "price", "type": "currency", "required": True}
                    ]
                },
                {
                    "id": "orders", "name": "Orders",
                    "fields": [
                        {"id": "o1", "name": "id", "type": "integer", "required": True},
                        {"id": "o2", "name": "user_id", "type": "integer", "required": True},
                        {"id": "o3", "name": "product_id", "type": "integer", "required": True},
                        {"id": "o4", "name": "order_date", "type": "date", "required": True}
                    ]
                },
                {
                    "id": "reviews", "name": "Reviews",
                    "fields": [
                        {"id": "r1", "name": "id", "type": "integer", "required": True},
                        {"id": "r2", "name": "order_id", "type": "integer", "required": True},
                        {"id": "r3", "name": "rating", "type": "integer", "config": {"min": 1, "max": 5}},
                        {"id": "r4", "name": "comment", "type": "text"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel1", "parent_table": "users", "parent_pk": "id", "child_table": "orders", "child_fk": "user_id"},
                {"id": "rel2", "parent_table": "products", "parent_pk": "id", "child_table": "orders", "child_fk": "product_id"},
                {"id": "rel3", "parent_table": "orders", "parent_pk": "id", "child_table": "reviews", "child_fk": "order_id"}
            ]
        }
    },
    {
        "id": "education",
        "name": "Student Management",
        "description": "Enrollments, grades, and course tracking.",
        "icon": "graduation-cap",
        "schema_data": {
            "tables": [
                {
                    "id": "students", "name": "Students",
                    "fields": [
                        {"id": "s1", "name": "id", "type": "integer"},
                        {"id": "s2", "name": "full_name", "type": "name"},
                        {"id": "s3", "name": "major", "type": "string"}
                    ]
                },
                {
                    "id": "courses", "name": "Courses",
                    "fields": [
                        {"id": "c1", "name": "id", "type": "integer"},
                        {"id": "c2", "name": "code", "type": "string"},
                        {"id": "c3", "name": "title", "type": "string"}
                    ]
                },
                {
                    "id": "enrollments", "name": "Enrollments",
                    "fields": [
                        {"id": "e1", "name": "id", "type": "integer"},
                        {"id": "e2", "name": "student_id", "type": "integer"},
                        {"id": "e3", "name": "course_id", "type": "integer"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel_s_e", "parent_table": "students", "parent_pk": "id", "child_table": "enrollments", "child_fk": "student_id"},
                {"id": "rel_c_e", "parent_table": "courses", "parent_pk": "id", "child_table": "enrollments", "child_fk": "course_id"}
            ]
        }
    },
    {
        "id": "iot",
        "name": "IoT Sensor Network",
        "description": "High-frequency sensor readings and device metadata.",
        "icon": "cpu",
        "schema_data": {
            "tables": [
                {
                    "id": "devices", "name": "Devices",
                    "fields": [
                        {"id": "d1", "name": "id", "type": "integer"},
                        {"id": "d2", "name": "type", "type": "string"}
                    ]
                },
                {
                    "id": "readings", "name": "Readings",
                    "fields": [
                        {"id": "rd1", "name": "id", "type": "integer"},
                        {"id": "rd2", "name": "device_id", "type": "integer"},
                        {"id": "rd3", "name": "value", "type": "float"},
                        {"id": "rd4", "name": "timestamp", "type": "datetime"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel_d_rd", "parent_table": "devices", "parent_pk": "id", "child_table": "readings", "child_fk": "device_id"}
            ]
        }
    },
    {
        "id": "healthcare",
        "name": "Healthcare EMR",
        "description": "Patients, doctors, and medical appointments scheduling.",
        "icon": "activity",
        "schema_data": {
            "tables": [
                {
                    "id": "patients", "name": "Patients",
                    "fields": [
                        {"id": "pt1", "name": "id", "type": "integer", "required": True},
                        {"id": "pt2", "name": "full_name", "type": "name"},
                        {"id": "pt3", "name": "date_of_birth", "type": "date"},
                        {"id": "pt4", "name": "blood_group", "type": "word"}
                    ]
                },
                {
                    "id": "doctors", "name": "Doctors",
                    "fields": [
                        {"id": "dc1", "name": "id", "type": "integer", "required": True},
                        {"id": "dc2", "name": "name", "type": "name"},
                        {"id": "dc3", "name": "specialty", "type": "word"}
                    ]
                },
                {
                    "id": "appointments", "name": "Appointments",
                    "fields": [
                        {"id": "ap1", "name": "id", "type": "integer", "required": True},
                        {"id": "ap2", "name": "patient_id", "type": "integer"},
                        {"id": "ap3", "name": "doctor_id", "type": "integer"},
                        {"id": "ap4", "name": "appointment_time", "type": "datetime"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel_pt_ap", "parent_table": "patients", "parent_pk": "id", "child_table": "appointments", "child_fk": "patient_id"},
                {"id": "rel_dc_ap", "parent_table": "doctors", "parent_pk": "id", "child_table": "appointments", "child_fk": "doctor_id"}
            ]
        }
    },
    {
        "id": "finance",
        "name": "Banking & Finance",
        "description": "Accounts, customers, and transaction histories.",
        "icon": "dollar-sign",
        "schema_data": {
            "tables": [
                {
                    "id": "customers", "name": "Customers",
                    "fields": [
                        {"id": "cu1", "name": "id", "type": "integer", "required": True},
                        {"id": "cu2", "name": "name", "type": "name"},
                        {"id": "cu3", "name": "ssn", "type": "ssn"}
                    ]
                },
                {
                    "id": "accounts", "name": "Accounts",
                    "fields": [
                        {"id": "ac1", "name": "id", "type": "integer", "required": True},
                        {"id": "ac2", "name": "customer_id", "type": "integer"},
                        {"id": "ac3", "name": "account_type", "type": "word"},
                        {"id": "ac4", "name": "balance", "type": "currency"}
                    ]
                },
                {
                    "id": "transactions", "name": "Transactions",
                    "fields": [
                        {"id": "tx1", "name": "id", "type": "integer", "required": True},
                        {"id": "tx2", "name": "account_id", "type": "integer"},
                        {"id": "tx3", "name": "amount", "type": "currency"},
                        {"id": "tx4", "name": "tx_date", "type": "datetime"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel_cu_ac", "parent_table": "customers", "parent_pk": "id", "child_table": "accounts", "child_fk": "customer_id"},
                {"id": "rel_ac_tx", "parent_table": "accounts", "parent_pk": "id", "child_table": "transactions", "child_fk": "account_id"}
            ]
        }
    },
    {
        "id": "saas",
        "name": "B2B SaaS Platform",
        "description": "Organizations, users, and billing subscriptions.",
        "icon": "cloud",
        "schema_data": {
            "tables": [
                {
                    "id": "organizations", "name": "Organizations",
                    "fields": [
                        {"id": "org1", "name": "id", "type": "integer", "required": True},
                        {"id": "org2", "name": "company_name", "type": "company"}
                    ]
                },
                {
                    "id": "users", "name": "Users",
                    "fields": [
                        {"id": "u1", "name": "id", "type": "integer", "required": True},
                        {"id": "u2", "name": "org_id", "type": "integer"},
                        {"id": "u3", "name": "email", "type": "email"},
                        {"id": "u4", "name": "role", "type": "word"}
                    ]
                },
                {
                    "id": "subscriptions", "name": "Subscriptions",
                    "fields": [
                        {"id": "sub1", "name": "id", "type": "integer", "required": True},
                        {"id": "sub2", "name": "org_id", "type": "integer"},
                        {"id": "sub3", "name": "plan_name", "type": "word"},
                        {"id": "sub4", "name": "mrr", "type": "currency"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel_org_u", "parent_table": "organizations", "parent_pk": "id", "child_table": "users", "child_fk": "org_id"},
                {"id": "rel_org_sub", "parent_table": "organizations", "parent_pk": "id", "child_table": "subscriptions", "child_fk": "org_id"}
            ]
        }
    },
    {
        "id": "hr",
        "name": "HR & Payroll",
        "description": "Employees, departments, and payroll records.",
        "icon": "users",
        "schema_data": {
            "tables": [
                {
                    "id": "departments", "name": "Departments",
                    "fields": [
                        {"id": "dep1", "name": "id", "type": "integer", "required": True},
                        {"id": "dep2", "name": "department_name", "type": "word"}
                    ]
                },
                {
                    "id": "employees", "name": "Employees",
                    "fields": [
                        {"id": "emp1", "name": "id", "type": "integer", "required": True},
                        {"id": "emp2", "name": "department_id", "type": "integer"},
                        {"id": "emp3", "name": "name", "type": "name"},
                        {"id": "emp4", "name": "job_title", "type": "job_title"}
                    ]
                },
                {
                    "id": "payroll", "name": "Payroll",
                    "fields": [
                        {"id": "pay1", "name": "id", "type": "integer", "required": True},
                        {"id": "pay2", "name": "employee_id", "type": "integer"},
                        {"id": "pay3", "name": "salary", "type": "currency"},
                        {"id": "pay4", "name": "pay_date", "type": "date"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel_dep_emp", "parent_table": "departments", "parent_pk": "id", "child_table": "employees", "child_fk": "department_id"},
                {"id": "rel_emp_pay", "parent_table": "employees", "parent_pk": "id", "child_table": "payroll", "child_fk": "employee_id"}
            ]
        }
    },
    {
        "id": "logistics",
        "name": "Logistics & Fleet",
        "description": "Warehouses, fleet vehicles, and shipments.",
        "icon": "truck",
        "schema_data": {
            "tables": [
                {
                    "id": "warehouses", "name": "Warehouses",
                    "fields": [
                        {"id": "wh1", "name": "id", "type": "integer", "required": True},
                        {"id": "wh2", "name": "location", "type": "address"}
                    ]
                },
                {
                    "id": "vehicles", "name": "Vehicles",
                    "fields": [
                        {"id": "v1", "name": "id", "type": "integer", "required": True},
                        {"id": "v2", "name": "license_plate", "type": "string"},
                        {"id": "v3", "name": "capacity_kg", "type": "integer"}
                    ]
                },
                {
                    "id": "shipments", "name": "Shipments",
                    "fields": [
                        {"id": "sh1", "name": "id", "type": "integer", "required": True},
                        {"id": "sh2", "name": "warehouse_id", "type": "integer"},
                        {"id": "sh3", "name": "vehicle_id", "type": "integer"},
                        {"id": "sh4", "name": "status", "type": "word"}
                    ]
                }
            ],
            "relationships": [
                {"id": "rel_wh_sh", "parent_table": "warehouses", "parent_pk": "id", "child_table": "shipments", "child_fk": "warehouse_id"},
                {"id": "rel_v_sh", "parent_table": "vehicles", "parent_pk": "id", "child_table": "shipments", "child_fk": "vehicle_id"}
            ]
        }
    }
]

def get_templates():
    return TEMPLATES
