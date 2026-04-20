--
-- PostgreSQL database dump
--

\restrict Upaf6HdWqDE8VoinLKNeGx3eMYPCNHvADpHboueP9V67WxumKMk5MvBfgSVbmIG

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-02 22:02:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16436)
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    id integer NOT NULL,
    house_no character varying(50) NOT NULL,
    resident_name character varying(255),
    billing_month character varying(50),
    maintenance_charges numeric(10,2),
    total_amount numeric(10,2),
    status character varying(20) DEFAULT 'Unpaid'::character varying,
    due_date date,
    payment_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16435)
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bills_id_seq OWNER TO postgres;

--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 225
-- Name: bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bills_id_seq OWNED BY public.bills.id;


--
-- TOC entry 232 (class 1259 OID 16487)
-- Name: complaints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaints (
    id integer NOT NULL,
    resident_name character varying(100),
    house_no character varying(20),
    subject character varying(255) NOT NULL,
    description text NOT NULL,
    status character varying(20) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.complaints OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16486)
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.complaints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complaints_id_seq OWNER TO postgres;

--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 231
-- Name: complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;


--
-- TOC entry 228 (class 1259 OID 16447)
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    category character varying(100),
    description text,
    amount numeric(10,2),
    expense_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16446)
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 227
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- TOC entry 220 (class 1259 OID 16389)
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    phone_no character varying(20) NOT NULL,
    house_no character varying(50) NOT NULL,
    ownership_status character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    block_name character varying(50),
    owner_name_if_tenant character varying(255),
    owner_phone_if_tenant character varying(20),
    vehicle_no character varying(50),
    vehicle_type character varying(20),
    cnic character varying(15),
    owner_cnic_if_tenant character varying(15),
    email character varying(255)
);


ALTER TABLE public.members OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16388)
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.members_id_seq OWNER TO postgres;

--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 219
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- TOC entry 230 (class 1259 OID 16474)
-- Name: notices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notices (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    category character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    scheduled_date date,
    scheduled_time time without time zone
);


ALTER TABLE public.notices OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16473)
-- Name: notices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notices_id_seq OWNER TO postgres;

--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 229
-- Name: notices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notices_id_seq OWNED BY public.notices.id;


--
-- TOC entry 222 (class 1259 OID 16404)
-- Name: ownership_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ownership_history (
    id integer NOT NULL,
    house_no character varying(50) NOT NULL,
    previous_owner character varying(255),
    new_owner character varying(255),
    transfer_date date DEFAULT CURRENT_DATE,
    transfer_type character varying(50)
);


ALTER TABLE public.ownership_history OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16403)
-- Name: ownership_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ownership_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ownership_history_id_seq OWNER TO postgres;

--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 221
-- Name: ownership_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ownership_history_id_seq OWNED BY public.ownership_history.id;


--
-- TOC entry 234 (class 1259 OID 16501)
-- Name: polls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.polls (
    id integer NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.polls OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16500)
-- Name: polls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.polls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.polls_id_seq OWNER TO postgres;

--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 233
-- Name: polls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.polls_id_seq OWNED BY public.polls.id;


--
-- TOC entry 224 (class 1259 OID 16417)
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    unit_id integer NOT NULL,
    unit_no character varying(50) NOT NULL,
    unit_type character varying(50) NOT NULL,
    floor_no integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    base_charges numeric(10,2) DEFAULT 0.00,
    marla numeric(10,2)
);


ALTER TABLE public.units OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16416)
-- Name: units_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.units_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.units_unit_id_seq OWNER TO postgres;

--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 223
-- Name: units_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_unit_id_seq OWNED BY public.units.unit_id;


--
-- TOC entry 4899 (class 2604 OID 16439)
-- Name: bills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills ALTER COLUMN id SET DEFAULT nextval('public.bills_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 16490)
-- Name: complaints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 16450)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 16392)
-- Name: members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 16477)
-- Name: notices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notices ALTER COLUMN id SET DEFAULT nextval('public.notices_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 16407)
-- Name: ownership_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownership_history ALTER COLUMN id SET DEFAULT nextval('public.ownership_history_id_seq'::regclass);


--
-- TOC entry 4910 (class 2604 OID 16504)
-- Name: polls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls ALTER COLUMN id SET DEFAULT nextval('public.polls_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 16420)
-- Name: units unit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN unit_id SET DEFAULT nextval('public.units_unit_id_seq'::regclass);


--
-- TOC entry 5085 (class 0 OID 16436)
-- Dependencies: 226
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (id, house_no, resident_name, billing_month, maintenance_charges, total_amount, status, due_date, payment_date, created_at) FROM stdin;
2	1	test1	January 2026	2000.00	2000.00	Paid	2026-02-28	2026-02-20	2026-02-20 01:53:04.101247
10	4	test4	March 2026	3000.00	3000.00	Unpaid	2026-03-10	\N	2026-02-21 17:13:25.445824
11	5	teeeeest1	March 2026	3000.00	3000.00	Unpaid	2026-03-10	\N	2026-02-21 17:13:25.449663
12	6	Oneeb	March 2026	3000.00	3000.00	Unpaid	2026-03-10	\N	2026-02-21 17:13:25.453787
1	2	test2	January 2026	2000.00	2000.00	Paid	2026-02-28	2026-02-21	2026-02-20 01:53:04.011269
3	3	test3	January 2026	2000.00	2000.00	Paid	2026-02-28	2026-02-21	2026-02-20 01:53:04.106813
5	4	test4	January 2026	2000.00	2000.00	Paid	2026-02-28	2026-02-21	2026-02-20 01:53:04.231506
6	5	test5	January 2026	2000.00	2000.00	Paid	2026-02-28	2026-02-21	2026-02-20 01:53:04.231783
4	6	Oneeb	January 2026	2000.00	2000.00	Paid	2026-02-28	2026-02-22	2026-02-20 01:53:04.121211
8	1	test1	March 2026	3000.00	3000.00	Paid	2026-03-10	2026-02-27	2026-02-21 17:13:25.437964
7	2	test2	March 2026	3000.00	3000.00	Paid	2026-03-10	2026-03-01	2026-02-21 17:13:25.388646
9	3	test3	March 2026	3000.00	3000.00	Paid	2026-03-10	2026-03-01	2026-02-21 17:13:25.441653
\.


--
-- TOC entry 5091 (class 0 OID 16487)
-- Dependencies: 232
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaints (id, resident_name, house_no, subject, description, status, created_at) FROM stdin;
1	Oneeb	H-101	EMERGENCY SOS	Resident triggered an immediate emergency alert!	Urgent	2026-02-22 02:28:26.911369
2	Oneeb	H-101	EMERGENCY SOS	Resident triggered an immediate emergency alert!	Urgent	2026-02-24 01:46:47.76852
3	Oneeb	H-101	aasasas	asasas	Pending	2026-02-25 00:57:43.984126
4	Oneeb	H-101	EMERGENCY SOS	Resident triggered an immediate emergency alert!	Urgent	2026-02-25 01:07:37.352395
5	Oneeb	H-101	EMERGENCY SOS	Resident triggered an alert!	Urgent	2026-03-01 03:01:21.043743
6	Oneeb	H-101	EMERGENCY SOS	Resident triggered an alert!	Urgent	2026-03-01 17:02:53.945018
\.


--
-- TOC entry 5087 (class 0 OID 16447)
-- Dependencies: 228
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, category, description, amount, expense_date, created_at) FROM stdin;
3	Staff Salaries	Monthly Staff Salary	50000.00	2026-02-01	2026-02-21 00:57:58.408242
4	Repairs	Gate Repairing	15000.00	2026-02-12	2026-02-21 00:59:36.360121
\.


--
-- TOC entry 5079 (class 0 OID 16389)
-- Dependencies: 220
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, full_name, phone_no, house_no, ownership_status, created_at, block_name, owner_name_if_tenant, owner_phone_if_tenant, vehicle_no, vehicle_type, cnic, owner_cnic_if_tenant, email) FROM stdin;
19	test1	0309-9889598	1	Owner	2026-02-17 19:49:14.889783	Block 2	\N	\N		Car	35201-9898989-9	\N	\N
21	test3	0305-9887456	3	Owner	2026-02-17 19:50:18.276963	Block 1	\N	\N		None	35201-9845698-7	\N	\N
24	Oneeb	0304-9885959	6	Owner	2026-02-20 01:23:25.882391	Block 2	\N	\N	LEA-4569	Bike	35201-9789965-9	\N	oneebbaig18@gmail.com
18	teeeeest1	0305-9887474	5	Owner	2026-02-17 18:21:24.072526	Block 3	\N	\N	LEA-1234	Bike	35201-9878854-9	\N	\N
22	test-new	0305-9887456	4	Owner	2026-02-17 19:50:35.957034	Block 2	\N	\N		None	35201-9845698-8	\N	\N
26	ahmad	0305-9887989	96	Owner	2026-03-01 02:52:29.809316	Block 1	usman	0305-9887989	LEA-8896	Car	35201-6898895-8	35201-6898895-8	oneebbaig18@gmail.com
25	anas	0306-9889568	2	Owner	2026-02-25 01:20:06.265964	Block 1	\N	\N	LEA-7895	Car	35241-9868875-6	\N	oneebbaig18@gmail.com
\.


--
-- TOC entry 5089 (class 0 OID 16474)
-- Dependencies: 230
-- Data for Name: notices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notices (id, title, content, category, created_at, scheduled_date, scheduled_time) FROM stdin;
5	Meeting New	ssdsdsd	Meeting	2026-02-25 00:40:39.780439	2026-02-26	08:08:00
6	Meeting-new	sfssfsfcdesdfdf	Meeting	2026-03-01 17:02:31.884766	2026-03-02	16:44:00
\.


--
-- TOC entry 5081 (class 0 OID 16404)
-- Dependencies: 222
-- Data for Name: ownership_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ownership_history (id, house_no, previous_owner, new_owner, transfer_date, transfer_type) FROM stdin;
1	4	test1	usman	2026-02-14	Sale
2	5	test5	teeeeest1	2026-02-21	Sale
3	2	Oneeb Baig	Anas	2026-02-25	Sale
4	4	test4	test-new	2026-03-01	Sale
5	2	Anas	tranfer2	2026-03-02	Sale
6	2	tranfer2	anas	2026-03-02	abc
\.


--
-- TOC entry 5093 (class 0 OID 16501)
-- Dependencies: 234
-- Data for Name: polls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.polls (id, question, options, is_active, created_at) FROM stdin;
1	Should gate no.3 needs to be repaired ?	{"No": 0, "Yes": 0}	f	2026-02-25 00:49:53.877917
2	Gate no.3 Repairing	{"No": 0, "Yes": 0}	f	2026-02-25 00:50:34.041125
3	Should gate no.3 needs to be repaired ?	{"No": 0, "Yes": 0}	f	2026-02-25 00:53:29.904895
5	Gate Repairing	{"No": 0, "Yes": 0}	t	2026-02-25 01:07:00.861846
6	Society Picnic	{"No": 0, "Yes": 0}	t	2026-02-25 01:07:15.621365
\.


--
-- TOC entry 5083 (class 0 OID 16417)
-- Dependencies: 224
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (unit_id, unit_no, unit_type, floor_no, created_at, base_charges, marla) FROM stdin;
10	2	Plot	\N	2026-02-17 19:48:11.972352	0.00	5.00
9	1	House	2	2026-02-17 19:48:00.756217	0.00	10.00
11	3	House	3	2026-02-17 19:48:29.164395	0.00	\N
12	4	House	3	2026-02-17 19:48:40.456524	0.00	3.00
8	5	House	3	2026-02-17 18:20:45.275675	0.00	5.00
13	6	House	2	2026-02-20 01:22:45.754965	0.00	5.00
\.


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 225
-- Name: bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bills_id_seq', 12, true);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 231
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaints_id_seq', 6, true);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 227
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 4, true);


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 219
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.members_id_seq', 26, true);


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 229
-- Name: notices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notices_id_seq', 6, true);


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 221
-- Name: ownership_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ownership_history_id_seq', 6, true);


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 233
-- Name: polls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.polls_id_seq', 6, true);


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 223
-- Name: units_unit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_unit_id_seq', 14, true);


--
-- TOC entry 4922 (class 2606 OID 16445)
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 16499)
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- TOC entry 4924 (class 2606 OID 16457)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4914 (class 2606 OID 16400)
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 16485)
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- TOC entry 4916 (class 2606 OID 16414)
-- Name: ownership_history ownership_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownership_history
    ADD CONSTRAINT ownership_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 16513)
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);


--
-- TOC entry 4918 (class 2606 OID 16428)
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (unit_id);


--
-- TOC entry 4920 (class 2606 OID 16430)
-- Name: units units_unit_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_unit_no_key UNIQUE (unit_no);


-- Completed on 2026-03-02 22:02:27

--
-- PostgreSQL database dump complete
--

\unrestrict Upaf6HdWqDE8VoinLKNeGx3eMYPCNHvADpHboueP9V67WxumKMk5MvBfgSVbmIG

