-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 29, 2016 at 01:11 AM
-- Server version: 5.5.53-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `Taski`
--

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE IF NOT EXISTS `session` (
  `sessionId` varchar(30) NOT NULL,
  `username` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`sessionId`, `username`) VALUES
('7429d94b-7815-49f0-8bd1-625ae5', 'user1');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE IF NOT EXISTS `tasks` (
  `username` varchar(100) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `dueDate` datetime DEFAULT NULL,
  `isAllDayEvent` tinyint(1) DEFAULT NULL,
  `isCompleted` tinyint(1) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`username`, `title`, `description`, `dueDate`, `isAllDayEvent`, `isCompleted`, `id`) VALUES
('user1', 'Task 1', NULL, NULL, 0, 0, 1),
('user1', 'Task 1', NULL, NULL, 0, 0, 2),
('user1', 'Task 1', NULL, NULL, 0, 0, 3),
('user1', 'Task 1', NULL, NULL, 0, 0, 4),
('user1', 'Task 5', NULL, NULL, 0, 0, 5),
('user1', 'Small one is tired', NULL, NULL, 0, 0, 6),
('user1', 'Task 6', NULL, NULL, 0, 0, 7),
('user1', 'Task 6', NULL, NULL, 0, 0, 8),
('user1', 'Task 7', NULL, NULL, 0, 0, 9),
('user1', 'Task 10', NULL, NULL, 0, 0, 10),
('user1', 'I heart Smallz', NULL, NULL, 0, 0, 11);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `username` varchar(20) NOT NULL,
  `password` varchar(60) NOT NULL,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `email` varchar(60) NOT NULL,
  `id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`username`, `password`, `firstname`, `lastname`, `email`, `id`) VALUES
('user1', '$2a$10$fB5OC1.Lp7Z19XuyFDf5QePaU5CMSLMRx.P.YsvSnoiFU2IAAJERi', 'Henry', 'Aghaulor', 'henry.aghaulor@gmail.com', 'db432260-0063-49dc-ace0-4fb04ecf9848');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
