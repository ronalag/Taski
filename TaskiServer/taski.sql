-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 13, 2017 at 08:35 PM
-- Server version: 5.7.16-0ubuntu0.16.04.1
-- PHP Version: 7.0.8-0ubuntu0.16.04.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Taski`
--
CREATE DATABASE IF NOT EXISTS `Taski` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `Taski`;

-- --------------------------------------------------------

--
-- Table structure for table `label`
--

DROP TABLE IF EXISTS `label`;
CREATE TABLE IF NOT EXISTS `label` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
CREATE TABLE IF NOT EXISTS `session` (
  `id` varchar(100) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`id`, `userid`) VALUES
('ba797a95-88bf-40e6-8314-892bfeede25a', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE IF NOT EXISTS `tasks` (
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `dueDate` datetime DEFAULT NULL,
  `isAllDayEvent` tinyint(1) DEFAULT NULL,
  `isCompleted` tinyint(1) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`title`, `description`, `dueDate`, `isAllDayEvent`, `isCompleted`, `id`, `userid`) VALUES
('Task 1', 'Here is a description', NULL, 0, 0, 1, 1),
('Task 1', NULL, NULL, 0, 0, 2, 1),
('Task 1', NULL, NULL, 0, 0, 3, 1),
('Task 1', NULL, NULL, 0, 0, 4, 1),
('Task 5', NULL, NULL, 0, 0, 5, 1),
('Small one is tired', NULL, NULL, 0, 0, 6, 1),
('Task 6', NULL, NULL, 0, 0, 7, 1),
('Task 6', NULL, NULL, 0, 0, 8, 1),
('Task 7', NULL, NULL, 0, 0, 9, 1),
('Task 10', NULL, NULL, 0, 0, 10, 1),
('I heart Smallz', NULL, NULL, 0, 0, 11, 1),
('title', 'description', NULL, 0, 0, 12, 1),
('blah', NULL, NULL, 0, 0, 13, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(60) NOT NULL,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `email` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `password`, `firstname`, `lastname`, `email`) VALUES
(1, 'user1', '$2a$10$fB5OC1.Lp7Z19XuyFDf5QePaU5CMSLMRx.P.YsvSnoiFU2IAAJERi', 'Henry', 'Aghaulor', 'henry.aghaulor@gmail.com'),
(2, 'user2', '$2a$10$FhI/T5cyiwolyYVvlXbyZOfW4jm/P0qOEnQQ9CHEeQ1sPaeLr2Gc.', 'Henry', 'Aghaulor', 'ikwechukwu@yahoo.co.uk'),
(3, 'user4', '$2a$12$Q68u12o1OMQNJC.qcLOHse/nOTBvgjZCXVLwK0yeM2w6ONuwOa6rG', 'first', 'last', 'fl@gmail.com'),
(4, 'user3', '$2a$12$mrYTa15IJu1kDqJgfivc8OP79cFXdPqx99gacE4y2rcwA/ctXEwEO', 'first', 'last', 'fl@gmail.com'),
(5, 'user6', '$2a$12$nrxdk65hrXLPCoqkHZnRge63idSSHGVwVMjFZlKjIi6V390EogFRG', 'first', 'last', 'blah'),
(6, 'user7', '$2a$12$taFl5YmuTt530neHxJJWne8Er8zPUoDJbrmnCQS.ioDCevTf67xYe', 'first', 'name', 'email@gmail.com');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
