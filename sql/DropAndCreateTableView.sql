USE [WagEngineering]
GO

/****** Object:  View [dbo].[ViewOfDailyMaxSolidworksLicData]    Script Date: 11/18/2016 11:10:31 ******/
IF  EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[ViewOfDailyMaxSolidworksLicData]'))
DROP VIEW [dbo].[ViewOfDailyMaxSolidworksLicData]
GO

USE [WagEngineering]
GO

/****** Object:  View [dbo].[ViewOfDailyMaxSolidworksLicData]    Script Date: 11/18/2016 11:10:31 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[ViewOfDailyMaxSolidworksLicData]
AS(
    select 
        ISNULL([swofficepremium],0) as [swofficepremium],
        ISNULL([draftsightpremium],0) as [draftsightpremium],
        ISNULL([solidworks],0) as solidworks,
        ISNULL([swepdm_cadeditorandweb],0) as [swepdm_cadeditorandweb],
        ISNULL([swepdm_processor],0) as [swepdm_processor],
        ISNULL([swinspection_std],0) as [swinspection_std],
        ISNULL([swofficepro],0) as [swofficepro],
        [Date],
        [WeekDay]
    from(
        select 
            tmp.Entrypoint as Entrypoint,
            ISNULL(tmp.DailyMax,0) as UserLic,
            tmp.DateTime as Date,
            tmp.WeekDay as WeekDay
        from(
            select 
                Entrypoint,
                ISNULL(DailyMax,0) as DailyMax,
                CONVERT(Date,DateTime) as DateTime,
                DATENAME(dw,[DateTime]) as WeekDay
            from [WagEngineering].[dbo].[SolidworksLicUse]
        ) as tmp
        where tmp.Entrypoint in ('swofficepro','swinspection_std','swofficepremium','draftsightpremium','solidworks','swepdm_cadeditorandweb','swepdm_processor')
        and tmp.WeekDay not in ('Sunday','Saturday')
        group by tmp.Entrypoint,tmp.DailyMax,tmp.DateTime,tmp.WeekDay 
    )as slu
PIVOT(
    max(UserLic)
    for Entrypoint in (
        [swofficepro],
        [swinspection_std],
        [swofficepremium],
        [draftsightpremium],
        [solidworks],
        [swepdm_cadeditorandweb],
        [swepdm_processor]
        )
    ) as pvt
)
-- select CAST(DateTime as DATE) as RecordDate, Entrypoint, Max(DailyMax) as DailyMax
-- from SolidworksLicUse 
-- group by CAST(DateTime as DATE), Entrypoint


GO


