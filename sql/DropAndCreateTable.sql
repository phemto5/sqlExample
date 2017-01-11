USE [WagEngineering]
GO

/****** Object:  Table [dbo].[SolidworksLicUse]    Script Date: 11/18/2016 11:17:53 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolidworksLicUse]') AND type in (N'U'))
DROP TABLE [dbo].[SolidworksLicData]
GO

USE [WagEngineering]
GO

/****** Object:  Table [dbo].[SolidworksLicUse]    Script Date: 11/18/2016 11:17:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SolidworksLicData](
	[RecordDate] [datetime] NOT NULL,
	[swofficepremium] [int] NOT NULL,
    [draftsightpremium] [int] NOT NULL,
    [solidworks] [int] NOT NULL,
    [swepdm_cadeditorandweb] [int] NOT NULL,
    [swepdm_processor] [int] NOT NULL,
    [swinspection_std] [int] NOT NULL,
    [swofficepro] [int] NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO


