CREATE DATABASE  IF NOT EXISTS `torneio` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `torneio`;
-- MySQL dump 10.13  Distrib 5.5.16, for Win32 (x86)
--
-- Host: zeus.gank.eu    Database: torneio
-- ------------------------------------------------------
-- Server version	5.1.63-0ubuntu0.11.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `grupos_problemas`
--

DROP TABLE IF EXISTS `grupos_problemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grupos_problemas` (
  `idgrupos_problemas` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `desc` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idgrupos_problemas`),
  UNIQUE KEY `idgrupos_problemas_UNIQUE` (`idgrupos_problemas`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos_problemas`
--

LOCK TABLES `grupos_problemas` WRITE;
/*!40000 ALTER TABLE `grupos_problemas` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupos_problemas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams_log`
--

DROP TABLE IF EXISTS `teams_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teams_log` (
  `idteams_log` bigint(20) NOT NULL AUTO_INCREMENT,
  `idteams` bigint(20) NOT NULL,
  `data` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resposta` varchar(200) NOT NULL,
  `correct` tinyint(1) NOT NULL,
  `idgrupos_problemas` bigint(20) NOT NULL,
  `idproblemas` bigint(20) NOT NULL,
  `sum_of_points` int(11) NOT NULL,
  PRIMARY KEY (`idteams_log`),
  UNIQUE KEY `idteams_log_UNIQUE` (`idteams_log`),
  KEY `fk_teams_log_teams` (`idteams`),
  KEY `fk_teams_log_problemas1` (`idgrupos_problemas`,`idproblemas`),
  CONSTRAINT `fk_teams_log_problemas1` FOREIGN KEY (`idgrupos_problemas`, `idproblemas`) REFERENCES `problemas` (`idgrupos_problemas`, `idproblemas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_teams_log_teams` FOREIGN KEY (`idteams`) REFERENCES `teams` (`idteams`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1919 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams_log`
--

LOCK TABLES `teams_log` WRITE;
/*!40000 ALTER TABLE `teams_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `teams_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teams` (
  `idteams` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `administrationLevel` tinyint(4) DEFAULT '0',
  `problems_to_open_level_1` int(2) DEFAULT '0',
  `problems_to_open_level_2` int(2) DEFAULT '0',
  `problems_to_open_level_3` int(2) DEFAULT '0',
  `problems_to_open_level_4` int(2) DEFAULT '0',
  PRIMARY KEY (`idteams`),
  UNIQUE KEY `idteams_UNIQUE` (`idteams`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (31,'Administrator','Application Administrator','e071d8624c930dd2412ba7a5d20a0a2098a546747d901add852d47520adeb7875e8b1256b64eb4e6d4d3fc45857032c1701c14f74af2bb01a12d78484e2849ef',2,0,0,0,0);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `torneio_problems`
--

DROP TABLE IF EXISTS `torneio_problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `torneio_problems` (
  `idtorneio_problems` bigint(20) NOT NULL AUTO_INCREMENT,
  `idtorneio` bigint(20) NOT NULL,
  `idgrupos_problemas` bigint(20) NOT NULL,
  PRIMARY KEY (`idtorneio_problems`),
  KEY `fk_torneio_problems_torneio1` (`idtorneio`),
  KEY `fk_torneio_problems_grupos_problemas1` (`idgrupos_problemas`),
  CONSTRAINT `fk_torneio_problems_grupos_problemas1` FOREIGN KEY (`idgrupos_problemas`) REFERENCES `grupos_problemas` (`idgrupos_problemas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_torneio_problems_torneio1` FOREIGN KEY (`idtorneio`) REFERENCES `torneio` (`idtorneio`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `torneio_problems`
--

LOCK TABLES `torneio_problems` WRITE;
/*!40000 ALTER TABLE `torneio_problems` DISABLE KEYS */;
/*!40000 ALTER TABLE `torneio_problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `members` (
  `idmembers` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `idteams` bigint(20) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idmembers`),
  UNIQUE KEY `idmembers_UNIQUE` (`idmembers`),
  KEY `fk_members_teams1` (`idteams`),
  CONSTRAINT `fk_members_teams1` FOREIGN KEY (`idteams`) REFERENCES `teams` (`idteams`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problemas`
--

DROP TABLE IF EXISTS `problemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `problemas` (
  `idproblemas` bigint(20) NOT NULL AUTO_INCREMENT,
  `idgrupos_problemas` bigint(20) NOT NULL,
  `resposta` varchar(200) NOT NULL,
  `description` varchar(5000) DEFAULT NULL,
  `points` int(11) NOT NULL,
  `open` int(1) DEFAULT '0',
  `level` int(2) DEFAULT '1',
  PRIMARY KEY (`idproblemas`),
  KEY `fk_problemas_grupos_problemas1` (`idgrupos_problemas`),
  CONSTRAINT `fk_problemas_grupos_problemas1` FOREIGN KEY (`idgrupos_problemas`) REFERENCES `grupos_problemas` (`idgrupos_problemas`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problemas`
--

LOCK TABLES `problemas` WRITE;
/*!40000 ALTER TABLE `problemas` DISABLE KEYS */;
/*!40000 ALTER TABLE `problemas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `torneio`
--

DROP TABLE IF EXISTS `torneio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `torneio` (
  `idtorneio` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idtorneio`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `torneio`
--

LOCK TABLES `torneio` WRITE;
/*!40000 ALTER TABLE `torneio` DISABLE KEYS */;
INSERT INTO `torneio` VALUES (1,'Demo','Demo Tournament');
/*!40000 ALTER TABLE `torneio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config` (
  `idconfig` int(11) NOT NULL AUTO_INCREMENT,
  `idtorneio` bigint(20) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `random_problem_opening_interval` int(11) DEFAULT NULL,
  PRIMARY KEY (`idconfig`),
  KEY `fk_config_torneio1` (`idtorneio`),
  CONSTRAINT `fk_config_torneio1` FOREIGN KEY (`idtorneio`) REFERENCES `torneio` (`idtorneio`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config`
--

LOCK TABLES `config` WRITE;
/*!40000 ALTER TABLE `config` DISABLE KEYS */;
INSERT INTO `config` VALUES (3,1,'2012-07-07 19:45:00','2012-07-20 21:30:00',20000);
/*!40000 ALTER TABLE `config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `torneio_teams`
--

DROP TABLE IF EXISTS `torneio_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `torneio_teams` (
  `idtorneio_teams` bigint(20) NOT NULL AUTO_INCREMENT,
  `idteams` bigint(20) NOT NULL,
  `idtorneio` bigint(20) NOT NULL,
  PRIMARY KEY (`idtorneio_teams`),
  KEY `fk_torneio_teams_teams1` (`idteams`),
  KEY `fk_torneio_teams_torneio1` (`idtorneio`),
  CONSTRAINT `fk_torneio_teams_teams1` FOREIGN KEY (`idteams`) REFERENCES `teams` (`idteams`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_torneio_teams_torneio1` FOREIGN KEY (`idtorneio`) REFERENCES `torneio` (`idtorneio`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `torneio_teams`
--

LOCK TABLES `torneio_teams` WRITE;
/*!40000 ALTER TABLE `torneio_teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `torneio_teams` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-07-14 19:18:15
