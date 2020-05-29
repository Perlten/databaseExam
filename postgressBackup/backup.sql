--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

-- Started on 2020-05-25 16:15:58 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 2976 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 208 (class 1255 OID 41051)
-- Name: update_name_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_name_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
name_change int;
BEGIN
	IF NEW.name <> OLD.name THEN
		 INSERT INTO namelog (oldname, fk_account)
		 VALUES(old.name, old.phonenumber);
		 SELECT COUNT(*) into name_change from namelog n2 where n2.fk_account = old.phonenumber;
	if name_change > 2 then
		update accounts set suspicious  = true where phonenumber  = old.phonenumber;
	end if;
		
	END IF;

	RETURN NEW;
END;

$$;


ALTER FUNCTION public.update_name_log() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 202 (class 1259 OID 40984)
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    phonenumber text NOT NULL,
    name character varying(70) NOT NULL,
    suspicious boolean DEFAULT false NOT NULL,
    CONSTRAINT "checkIfPhoneNumber" CHECK ((phonenumber ~ '[0-9][0-9][0-9][0-9][0-9][0-9][0-9]'::text))
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 40992)
-- Name: creditcards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creditcards (
    cardnumber text NOT NULL,
    verificationcode integer NOT NULL,
    expirationdate text NOT NULL,
    fk_account text NOT NULL,
    CONSTRAINT "checkCreditcardLength" CHECK ((cardnumber ~ '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'::text)),
    CONSTRAINT checkexpirationdate CHECK ((expirationdate ~ '[0-9][0-9]-[0-9][0-9]'::text)),
    CONSTRAINT checkverificationlenghlarger CHECK ((verificationcode <= 999)),
    CONSTRAINT checkverificationlengthlarger CHECK ((verificationcode >= 111))
);


ALTER TABLE public.creditcards OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 41036)
-- Name: namelog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.namelog (
    id integer NOT NULL,
    oldname character varying(70) NOT NULL,
    fk_account text NOT NULL,
    date date DEFAULT now()
);


ALTER TABLE public.namelog OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 41034)
-- Name: namelog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.namelog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.namelog_id_seq OWNER TO postgres;

--
-- TOC entry 2980 (class 0 OID 0)
-- Dependencies: 206
-- Name: namelog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.namelog_id_seq OWNED BY public.namelog.id;


--
-- TOC entry 205 (class 1259 OID 41007)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    amount real NOT NULL,
    date date DEFAULT now() NOT NULL,
    approved boolean DEFAULT false,
    fk_creditcards text NOT NULL,
    webshoporderid character varying(25) NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 41005)
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO postgres;

--
-- TOC entry 2982 (class 0 OID 0)
-- Dependencies: 204
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- TOC entry 2825 (class 2604 OID 41039)
-- Name: namelog id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.namelog ALTER COLUMN id SET DEFAULT nextval('public.namelog_id_seq'::regclass);


--
-- TOC entry 2822 (class 2604 OID 41010)
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- TOC entry 2965 (class 0 OID 40984)
-- Dependencies: 202
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (phonenumber, name, suspicious) FROM stdin;
23232323	jesperHej	f
28940903	Perlt	t
29430903	das	t
22464462	Jesper Rusbjerg	f
\.


--
-- TOC entry 2966 (class 0 OID 40992)
-- Dependencies: 203
-- Data for Name: creditcards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creditcards (cardnumber, verificationcode, expirationdate, fk_account) FROM stdin;
1111111111111111	123	11-11	28940903
1111111111111112	123	11-11	29430903
1111111111111199	123	11-11	28940903
1234567891234567	666	12-12	28940903
1234567891234561	666	12-12	28940903
11111111111111111	123	11-11	28940903
\.


--
-- TOC entry 2970 (class 0 OID 41036)
-- Dependencies: 207
-- Data for Name: namelog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.namelog (id, oldname, fk_account, date) FROM stdin;
7	hejmed	28940903	2020-05-21
8	hejmed2	28940903	2020-05-21
9	hejmed3	28940903	2020-05-21
10	hejmed4	28940903	2020-05-21
11	Pernille	29430903	2020-05-21
12	Pe	29430903	2020-05-21
13	Peds	29430903	2020-05-21
\.


--
-- TOC entry 2968 (class 0 OID 41007)
-- Dependencies: 205
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, amount, date, approved, fk_creditcards, webshoporderid) FROM stdin;
18	23363	2020-05-24	t	11111111111111111	5eca72ba0b4cbbce00c061ec
19	2996	2020-05-24	t	11111111111111111	5eca74ac2c3bbad0a174f229
20	60486	2020-05-24	t	11111111111111111	5eca76966dae48d59707416d
\.


--
-- TOC entry 2984 (class 0 OID 0)
-- Dependencies: 206
-- Name: namelog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.namelog_id_seq', 13, true);


--
-- TOC entry 2985 (class 0 OID 0)
-- Dependencies: 204
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 20, true);


--
-- TOC entry 2828 (class 2606 OID 40991)
-- Name: accounts accounts_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pk PRIMARY KEY (phonenumber);


--
-- TOC entry 2830 (class 2606 OID 40999)
-- Name: creditcards creditcards_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditcards
    ADD CONSTRAINT creditcards_pk PRIMARY KEY (cardnumber);


--
-- TOC entry 2834 (class 2606 OID 41044)
-- Name: namelog namelog_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.namelog
    ADD CONSTRAINT namelog_pk PRIMARY KEY (id);


--
-- TOC entry 2832 (class 2606 OID 41012)
-- Name: transactions transactions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pk PRIMARY KEY (id);


--
-- TOC entry 2838 (class 2620 OID 41059)
-- Name: accounts updatenametrigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER updatenametrigger AFTER UPDATE OF name ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_name_log();


--
-- TOC entry 2835 (class 2606 OID 41000)
-- Name: creditcards creditcards_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditcards
    ADD CONSTRAINT creditcards_fk FOREIGN KEY (fk_account) REFERENCES public.accounts(phonenumber) ON DELETE CASCADE;


--
-- TOC entry 2837 (class 2606 OID 41045)
-- Name: namelog namelog_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.namelog
    ADD CONSTRAINT namelog_fk FOREIGN KEY (fk_account) REFERENCES public.accounts(phonenumber);


--
-- TOC entry 2836 (class 2606 OID 41017)
-- Name: transactions transactions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_fk FOREIGN KEY (fk_creditcards) REFERENCES public.creditcards(cardnumber);


--
-- TOC entry 2977 (class 0 OID 0)
-- Dependencies: 202
-- Name: TABLE accounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.accounts TO "jePerltUser";
GRANT ALL ON TABLE public.accounts TO "jePerltAdmin";


--
-- TOC entry 2978 (class 0 OID 0)
-- Dependencies: 203
-- Name: TABLE creditcards; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.creditcards TO "jePerltUser";
GRANT ALL ON TABLE public.creditcards TO "jePerltAdmin";


--
-- TOC entry 2979 (class 0 OID 0)
-- Dependencies: 207
-- Name: TABLE namelog; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.namelog TO "jePerltAdmin";


--
-- TOC entry 2981 (class 0 OID 0)
-- Dependencies: 205
-- Name: TABLE transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.transactions TO "jePerltUser";
GRANT ALL ON TABLE public.transactions TO "jePerltAdmin";


--
-- TOC entry 2983 (class 0 OID 0)
-- Dependencies: 204
-- Name: SEQUENCE transactions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.transactions_id_seq TO "jePerltUser";


-- Completed on 2020-05-25 16:15:59 CEST

--
-- PostgreSQL database dump complete
--

