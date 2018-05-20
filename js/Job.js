//--- persistence ------------------------------------------------------

const JOB_LS_PREFIX = "whoishiring.job.";

class Job extends MXStorable {
    constructor(islots) {
        ast(islots.yyyymm, "Please provide Job yyyymm property in init slots")
        ast(islots.id, "Please provide Job id property in init slots")
        ast(islots.text, "Please provide Job text property in init slots")
        let titleEnd = r.text.search("<p>");
        if (titleEnd === -1 )
            titleEnd = r.text.length

        super( Object.assign(
            {
                force: true
                , lsPrefix: JOB_LS_PREFIX+islots.yyyymm+"."+islots.id
            }
            , islots
            , {
                title: r.text.substring( 0, titleEnd)
            }), true, false)
    }

    static storableProperties () {
        // created and deleted are provided by MXStorable
        return ["id", "text", "title"].concat(super.storableProperties());
    }

    static loadFromStorage(yyyymm) {
        return mkm( null, 'JobGroup',
            {
                items: cI(MXStorable.loadAllItems(Job, JOB_LS_PREFIX + yyyymm)
                    .sort((a, b) => a.id < b.id ? -1 : 1) || [])
            })
    }
}


const Jobs = Job.loadFromStorage();

